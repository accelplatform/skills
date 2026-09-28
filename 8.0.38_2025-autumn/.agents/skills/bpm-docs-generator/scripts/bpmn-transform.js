/*
 * Usage:
 *   bun <このスクリプトのパス> <diagram.bpmn> <diagram.bpmn>
*/

const fs = require('fs');
const SimpleBpmnModdle = require('bpmn-moddle');
const ELBOW_CONNECTOR = 'ElbowConnector';
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

const _createModdle = function (options) {
  // Activiti 拡張パッケージ
  const activitiPackage = require('./moddle-package/activiti.json');
  const bpmnPackage = require('./moddle-package/activiti-bpmn.json');
  const bpmndiPackage = require('./moddle-package/activiti-bpmndi.json');

  return new SimpleBpmnModdle({
    activiti: activitiPackage,
    bpmn: bpmnPackage,
    bpmndi: bpmndiPackage
  }, options);
};

const bpm = _createModdle();

/** @typedef {'im-bpm'|'igrafx'|'other'} BpmnVendor */
/**
 * BPMN XML のネームスペース宣言・属性から製造ベンダーを判定する。
 * - ネームスペース URI に "www.igrafx.com" を含む → iGrafx 製（'igrafx'）
 * - xmlns:activiti="http://activiti.org/bpmn" を含む → IM-BPM 製（'im-bpm'）
 * - 上記いずれにも該当しない → その他（'other'）
 * @param {string} xml
 * @returns {BpmnVendor}
 */
function detectVendor(xml) {
  if (
    /exporter\s*=\s*"iGrafx"/i.test(xml) ||
    /\bixbpmn:/.test(xml) ||
    /xmlns:[^=\s]+\s*=\s*"[^"]*igrafx\.com[^"]*"/i.test(xml)
  ) {
    return 'igrafx';
  }
  if (/xmlns:activiti\s*=\s*"http:\/\/activiti\.org\/bpmn"/.test(xml)) {
    return 'im-bpm';
  }
  return 'other';
}

/**
 * TextAnnotation の注釈文からHTMLタグを除去する。
 * - <br> 系タグは改行(\n)に変換する
 * - 段落・改行相当のブロック要素の閉じタグ（</p> </div> </li> </h1〜6> </tr>）も改行に変換する
 * - 上記以外のHTMLタグはすべて除去する
 * - 主要なHTMLエンティティ（&lt; &gt; &quot; &#39; &nbsp; &amp;）はデコードする
 * - 3行以上連続する空行は2行にまとめ、前後の空白を除去する
 * @param {string} text
 * @returns {string}
 */
function stripAnnotationHtml(text) {
  if (!text) return text;

  let result = text;

  // <br> 系タグ → 改行
  result = result.replace(/<br\b[^>]*>/gi, '\n');

  // 残りのHTMLタグを除去
  result = result.replace(/<[^>]+>/g, '');

  // HTMLエンティティのデコード（&amp;は最後に処理し二重デコードを防止）
  result = result
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&');

  // 連続する空行を整理し、前後の空白を除去
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

function parseArgs(argv) {
  const args = {
    inputBpmnPath: null,
    outPutBpmnPath: null
  };
  args.inputBpmnPath = argv[0];
  args.outPutBpmnPath = argv[1];

  return args;
}
// XML を読み込む
const cleanBpmnXml = function (xml) {

  // イベントとゲートウェイのサイズを取得
  const eventSize = { width: 35, height: 35 };
  const errorBoundaryEventSize = { width: 29, height: 29 };
  const messageBoundaryEventSize = { width: 29, height: 29 };
  const signalBoundaryEventSize = { width: 29, height: 29 };
  const timerBoundaryEventSize = { width: 29, height: 29 };
  const gatewaySize = { width: 40, height: 40 };

  // サイズ変更のターゲットID
  const resizeTargets = [];
  // 許可する名前空間
  const allowedNamespaces = new Set([
    'http://www.omg.org/spec/BPMN/20100524/MODEL',
    'http://www.omg.org/spec/BPMN/20100524/DI',
    'http://www.omg.org/spec/DD/20100524/DC',
    'http://www.omg.org/spec/DD/20100524/DI',
    'http://www.w3.org/2001/XMLSchema-instance',
    'http://activiti.org/bpmn'
  ]);
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  cleanNode(doc.documentElement);

  resizeShape(doc.documentElement);

  return new XMLSerializer().serializeToString(doc);

  // 再帰的にクリーン
  function cleanNode(node) {
    // <bpmn:definitions> は削除対象外
    if (isDefinitionsNode(node)) {
      cleanChildren(node);
      return;
    }

    // 定義されてない名前空間なら削除
    if (node.namespaceURI && !allowedNamespaces.has(node.namespaceURI) && node.parentNode) {
      node.parentNode.removeChild(node);
      return;
    }

    // 不要な属性削除
    cleanAttributes(node);

    keepResizeTargetNode(node);

    // 注釈文（TextAnnotationのtext要素）のHTMLタグ除去
    cleanAnnotationText(node);

    // 子も処理
    cleanChildren(node);
  }

  // <bpmn:definitions> ノードかどうかをチェック
  function isDefinitionsNode(node) {
    return (
      node.nodeType === 1 &&
      node.localName === 'definitions' &&
      allowedNamespaces.has(node.namespaceURI)
    );
  }

  // サイズ変更対象（Event、Gateway）のIDと名前とdefinition要素を保存
  function keepResizeTargetNode(node) {
    const name = node.localName.toLowerCase();
    if (name.endsWith('event') || name.endsWith('gateway')) {
      const definitions = Array.from(node.children).filter(child => child.localName && child.localName.toLowerCase().endsWith('definition'));
      resizeTargets.push({ 'id': node.getAttribute('id'), 'name': name, 'definitions': definitions });
      return true;
    }
    return false;
  }

  // TextAnnotation の text 要素からHTMLタグを除去
  function cleanAnnotationText(node) {
    if (
      node.localName &&
      node.localName.toLowerCase() === 'text' &&
      node.parentNode &&
      node.parentNode.localName &&
      node.parentNode.localName.toLowerCase() === 'textannotation'
    ) {
      const original = node.textContent;
      const cleaned = stripAnnotationHtml(original);
      if (cleaned !== original) {
        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }
        node.appendChild(doc.createTextNode(cleaned));
      }
    }
  }

  // 属性をクリーンアップ
  function cleanAttributes(node) {
    const toRemove = [];
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes.item(i);
        if (
          attr.namespaceURI &&
          !allowedNamespaces.has(attr.namespaceURI)
        ) {
          toRemove.push(attr.name);
        }
      }
    }
    for (const name of toRemove) {
      node.removeAttribute(name);
    }
  }

  // 子ノードを再帰的にクリーンアップ
  function cleanChildren(node) {
    for (let child = node.firstChild; child != null;) {
      const next = child.nextSibling;
      if (child.nodeType === 1) {
        cleanNode(child);
      }
      child = next;
    }
  }

  // サイズ変更対象（Event、Gateway）のリサイズ
  function resizeShape(node) {
    if (node.localName.toLowerCase() === 'bpmnshape') {
      // BPMNShapeの場合、boundsのSizeを変更
      setBoundsSize(node);
    } else {
      // BPMNShape以外は子ノードを再帰的に処理
      for (let child = node.firstChild; child != null;) {
        const next = child.nextSibling;
        if (child.nodeType === 1) {
          resizeShape(child);
        }
        child = next;
      }
    }
  }

  function setBoundsSize(node) {
    const bpmnElement = node.getAttribute('bpmnElement');
    const target = resizeTargets.find(target => target.id === bpmnElement);
    if (!target) return;

    const boundsNode = Array.from(node.children).find(child => child.localName && child.localName.toLowerCase() === 'bounds');
    if (!boundsNode) return;

    // イベントのサイズ変更
    if (target.name.endsWith('event')) {
      if ((target.name.endsWith('boundaryevent'))) {
        // boundaryEventはDefinition別のサイズを使用
        if (target.definitions.some(def => def.localName.toLowerCase().endsWith('erroreventdefinition'))) {
          boundsNode.setAttribute('width', errorBoundaryEventSize.width);
          boundsNode.setAttribute('height', errorBoundaryEventSize.height);
        } else if (target.definitions.some(def => def.localName.toLowerCase().endsWith('messageeventdefinition'))) {
          boundsNode.setAttribute('width', messageBoundaryEventSize.width);
          boundsNode.setAttribute('height', messageBoundaryEventSize.height);
        } else if (target.definitions.some(def => def.localName.toLowerCase().endsWith('signaleventdefinition'))) {
          boundsNode.setAttribute('width', signalBoundaryEventSize.width);
          boundsNode.setAttribute('height', signalBoundaryEventSize.height);
        } else if (target.definitions.some(def => def.localName.toLowerCase().endsWith('timereventdefinition'))) {
          boundsNode.setAttribute('width', timerBoundaryEventSize.width);
          boundsNode.setAttribute('height', timerBoundaryEventSize.height);
        } else {
          // 該当Definitionが無い場合は共通サイズを使用
          boundsNode.setAttribute('width', eventSize.width);
          boundsNode.setAttribute('height', eventSize.height);
        }
      } else {
        // boundaryEvent以外は、共通サイズを使用
        boundsNode.setAttribute('width', eventSize.width);
        boundsNode.setAttribute('height', eventSize.height);
      }
    }

    // ゲートウェイのサイズ変更
    if (target.name.endsWith('gateway')) {
      boundsNode.setAttribute('width', gatewaySize.width);
      boundsNode.setAttribute('height', gatewaySize.height);
    }
  }
};

const fromXML = async function (xml) {
  const result = await bpm.fromXML(xml);
  // bpmn-moddle 9.x は { rootElement, references, warnings, elementsById } を返す
  return result.rootElement !== undefined ? result.rootElement : result;
};

/**
 * XML変換
 */
const toXML = async function (model) {
  const result = await bpm.toXML(model, { format: true });
  let xml = result.xml;

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');

  const definitions = xmlDoc.getElementsByTagName('definitions')[0] || xmlDoc.getElementsByTagName('bpmn:definitions')[0];
  definitions.setAttribute('xmlns:activiti', 'http://activiti.org/bpmn');
  definitions.setAttribute('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema');

  const serializer = new XMLSerializer();
  xml = serializer.serializeToString(xmlDoc);

  return xml;
};

/**
 * IM-BPMモデルに変換
 * （iGrafx製BPMNのDataObject変換用に作成）
 */
const convertImBpmModel = function (model) {
  if (!model || !model.diagrams) return null;
  const idsInfo = [];

  model.diagrams.forEach(function (diagram) {
    if (diagram.plane && diagram.plane.planeElement) {
      // DataObjectReferenceの追加
      diagram.plane.planeElement.forEach(function (bpmndiElement) {
        if (bpmndiElement.$type === 'bpmndi:BPMNShape') {
          model.rootElements.forEach(function (rootElement) {
            if (rootElement.$type === 'bpmn:Process') {
              addDataObjectReference(bpmndiElement, rootElement.flowElements, diagram.plane.planeElement, idsInfo);
            }
          });
        }
      });

      // Associationの追加
      diagram.plane.planeElement.forEach(function (bpmndiElement) {
        if (bpmndiElement.$type === 'bpmndi:BPMNEdge') {
          model.rootElements.forEach(function (rootElement) {
            if (rootElement.$type === 'bpmn:Process') {
              // DataInputAssociations・DataOutputAssociations要素の追加
              addDataInOutAssociations(bpmndiElement, rootElement.flowElements, diagram.plane.planeElement, idsInfo);

              addAssociations(bpmndiElement, rootElement.artifacts, diagram.plane.planeElement, idsInfo);
            }
          });
        }
      });

      // コネクタの形状の変更
      diagram.plane.$attrs = diagram.plane.$attrs || {};
      diagram.plane.$attrs['activiti:edgeStyle'] = ELBOW_CONNECTOR;
    }
  });

  // コピー元のDataObjectとAssociationの削除
  for (let i = 0; i < model.rootElements.length; i++) {
    const rootElement = model.rootElements[i];
    if (rootElement.$type === 'bpmn:Process') {
      // DataInputAssociation・DataOutputAssociationの削除
      deleteDataInOutAssociations(rootElement.flowElements, idsInfo);
      // Associationの削除
      deleteAssociation(rootElement.artifacts, idsInfo);
      // DataObjectの削除
      deleteDataObject(rootElement.flowElements, idsInfo);
    }
  }

  // DataObjectReference 要素の追加
  function addDataObjectReference(bpmndiElement, flowElements, planeElement, idsInfo) {
    if (!bpmndiElement || !bpmndiElement.bpmnElement || !flowElements || !planeElement) return;

    flowElements.forEach(flowElement => {
      if (flowElement.flowElements) {
        addDataObjectReference(bpmndiElement, flowElement.flowElements, planeElement, idsInfo);
      } else {
        const flowElementId = flowElement.id;
        // DataObjectかつBPMNShapeのが存在する場合、DataObjectReferenceとDataObjectReferenceのBPMNShapeを追加
        if (flowElement.$type === 'bpmn:DataObject' && bpmndiElement.bpmnElement.id === flowElementId) {
          const newId = 'dataObject_' + flowElementId;
          const options = {
            id: newId,
            name: flowElement.name
          };
          const dataObjectRef = bpm.create('bpmn:DataObjectReference', options);
          dataObjectRef.$parent = flowElement.$parent;

          const shape = bpm.create('bpmndi:BPMNShape', {
            id: 'BPMNShape_' + flowElementId,
            bpmnElement: dataObjectRef,
            bounds: bpmndiElement.bounds
          });
          shape.$parent = bpmndiElement.$parent;

          flowElements.push(dataObjectRef);
          planeElement.push(shape);

          // 旧IDと新IDを保存
          idsInfo.push({
            orgFlowElementId: flowElementId,
            newFlowElementId: newId
          });
        }
      }
    });
  };

  // DataInputAssociations・DataOutputAssociations要素の追加
  function addDataInOutAssociations(bpmndiElement, flowElements, planeElement, idsInfo) {
    if (!bpmndiElement || !bpmndiElement.bpmnElement || !flowElements || !planeElement) return;

    flowElements.forEach(flowElement => {
      if (flowElement.flowElements) {
        addDataInOutAssociations(bpmndiElement, flowElement.flowElements, planeElement, idsInfo);
      } else {
        addDataInputAssociation(bpmndiElement, flowElement, planeElement, idsInfo);

        addDataOutputAssociation(bpmndiElement, flowElement, planeElement, idsInfo);
      }
    });
  };

  // DataInputAssociations要素の追加
  function addDataInputAssociation(bpmndiElement, flowElement, planeElements, idsInfo) {
    if (!flowElement.dataInputAssociations || flowElement.dataInputAssociations.length === 0) return;

    const dataInputAssociations = flowElement.dataInputAssociations;
    dataInputAssociations.forEach(function (dataInputAssociation) {
      const dataAssociationId = dataInputAssociation.id;
      let addFlag = false;
      if (bpmndiElement.bpmnElement && bpmndiElement.bpmnElement.id === dataAssociationId) {
        const newSourceRef = JSON.parse(JSON.stringify(dataInputAssociation.sourceRef));
        let newTargetId = dataInputAssociation.targetRef.id;
        idsInfo.forEach(ids => {
          newSourceRef.forEach(source => {
            if (source.id === ids.orgFlowElementId) {
              if (!newSourceRef.some(ref => ref.id === ids.newFlowElementId)) source.id = ids.newFlowElementId;
              addFlag = true;
            }
          });
          if (dataInputAssociation.targetRef.id === ids.orgFlowElementId) {
            newTargetId = ids.newFlowElementId;
            addFlag = true;
          }
        });

        // 旧IDに該当するAssociationがある場合、新しいAssociationを作成
        if (addFlag) {
          const newDataInputAssociation = bpm.create('bpmn:DataInputAssociation', {
            id: 'data-association_' + dataAssociationId,
            sourceRef: newSourceRef,
            targetRef: { id: newTargetId }
          });
          newDataInputAssociation.$parent = flowElement.$parent;

          dataInputAssociations.push(newDataInputAssociation);

          // BPMNEdge要素の追加
          addEdge(dataAssociationId, bpmndiElement.waypoint, newDataInputAssociation, planeElements);
        }
      }
    });
  }

  // DataOutputAssociations要素の追加
  function addDataOutputAssociation(bpmndiElement, flowElement, planeElements, idsInfo) {
    if (!flowElement.dataOutputAssociations || flowElement.dataOutputAssociations.length === 0) return;

    const dataOutputAssociations = flowElement.dataOutputAssociations;
    dataOutputAssociations.forEach(function (dataOutputAssociation) {
      const dataAssociationId = dataOutputAssociation.id;
      let addFlag = false;
      if (bpmndiElement.bpmnElement && bpmndiElement.bpmnElement.id === dataAssociationId) {
        const newSourceRef = JSON.parse(JSON.stringify(dataOutputAssociation.sourceRef));
        let newTargetId = dataOutputAssociation.targetRef.id;
        idsInfo.forEach(ids => {
          newSourceRef.forEach(source => {
            if (source.id === ids.orgFlowElementId) {
              if (!newSourceRef.some(ref => ref.id === ids.newFlowElementId)) source.id = ids.newFlowElementId;
              addFlag = true;
            }
          });
          if (dataOutputAssociation.targetRef.id === ids.orgFlowElementId) {
            newTargetId = ids.newFlowElementId;
            addFlag = true;
          }
        });

        // 旧IDに該当するAssociationがある場合、新しいAssociationを作成
        if (addFlag) {
          const newDataOutputAssociation = bpm.create('bpmn:DataOutputAssociation', {
            id: 'data-association_' + dataAssociationId,
            sourceRef: newSourceRef,
            targetRef: { id: newTargetId }
          });
          newDataOutputAssociation.$parent = flowElement.$parent;

          dataOutputAssociations.push(newDataOutputAssociation);

          // BPMNEdge要素の追加
          addEdge(dataAssociationId, bpmndiElement.waypoint, newDataOutputAssociation, planeElements);
        }
      }
    });
  }

  function addAssociations(bpmndiElement, artifacts, planeElements, idsInfo) {
    if (!bpmndiElement || !bpmndiElement.bpmnElement || !artifacts || !planeElements) return;

    artifacts.forEach(artifact => {
      const associationId = artifact.id;
      let addFlag = false;
      if (bpmndiElement.bpmnElement.id !== associationId) return;

      let newSourceId = artifact.sourceRef.id;
      let newTargetId = artifact.targetRef.id;
      idsInfo.forEach(ids => {
        if (artifact.sourceRef.id === ids.orgFlowElementId) {
          newSourceId = ids.newFlowElementId;
          addFlag = true;
        }
        if (artifact.targetRef.id === ids.orgFlowElementId) {
          newTargetId = ids.newFlowElementId;
          addFlag = true;
        }
      });

      // 旧IDに該当するAssociationがある場合、新しいAssociationを作成
      if (addFlag) {
        const newAssociation = bpm.create('bpmn:Association', {
          id: 'association_' + associationId,
          sourceRef: { id: newSourceId },
          targetRef: { id: newTargetId },
          associationDirection: artifact.associationDirection
        });
        newAssociation.$parent = artifact.$parent;

        artifacts.push(newAssociation);

        // BPMNEdge要素の追加
        addEdge(associationId, bpmndiElement.waypoint, newAssociation, planeElements);
      }
    });
  };

  // BPMNEdge要素の追加
  function addEdge(id, waypoint, element, planeElements) {
    const edge = bpm.create('bpmndi:BPMNEdge', {
      id: 'BPMNEdge_' + id,
      waypoint: waypoint,
      bpmnElement: element
    });
    if (edge) planeElements.push(edge);
  }

  // DataObject要素の削除
  function deleteDataObject(flowElements, idsInfo) {
    if (!flowElements || !idsInfo || !idsInfo.length) return;

    // 先に子階層（SubProcess/EventSubProcess等）を再帰的に処理する
    for (let i = 0; i < flowElements.length; i++) {
      const flowElement = flowElements[i];
      if (flowElement.flowElements) {
        deleteDataObject(flowElement.flowElements, idsInfo);
      }
    }

    // 自階層のDataObjectを削除する（再帰ループとは独立させ、spliceによるインデックスずれの影響を受けないようにする）
    for (let j = 0; j < idsInfo.length; j++) {
      const idInfo = idsInfo[j];
      const idx = flowElements.findIndex(fe => fe.id === idInfo.orgFlowElementId && fe.$type === 'bpmn:DataObject');
      if (idx !== -1) {
        flowElements.splice(idx, 1);
      }
    }
  };

  function deleteDataInOutAssociations(flowElements, idsInfo) {
    if (!flowElements || !idsInfo || !idsInfo.length) return;

    for (let i = 0; i < flowElements.length; i++) {
      const flowElement = flowElements[i];
      if (flowElement.flowElements) {
        // flowElementsがある場合は再帰呼出し
        deleteDataInOutAssociations(flowElement.flowElements, idsInfo);
      } else {
        // DataInputAssociation削除
        deleteDataInputAssociation(flowElement, idsInfo);
        // DataOutputAssociation削除
        deleteDataOutputAssociation(flowElement, idsInfo);
      }
    }
  };

  // DataInputAssociation要素の削除
  // sourceRef.idまたはtargetRef.idが旧IDであるDataInputAssociationを削除
  function deleteDataInputAssociation(flowElement, idsInfo) {
    if (!flowElement.dataInputAssociations) return;
    for (let j = 0; j < idsInfo.length; j++) {
      const idInfo = idsInfo[j];
      for (let l = flowElement.dataInputAssociations.length - 1; l >= 0; l--) {
        const di = flowElement.dataInputAssociations[l];
        if ((di.sourceRef && di.sourceRef.some(ref => ref.id === idInfo.orgFlowElementId)) ||
          (di.targetRef && di.targetRef.id === idInfo.orgFlowElementId)) {
          flowElement.dataInputAssociations.splice(l, 1);
        }
      }
    }
  }

  // DataOutputAssociation要素の削除
  // sourceRef.idまたはtargetRef.idが旧IDであるDataOutputAssociationを削除
  function deleteDataOutputAssociation(flowElement, idsInfo) {
    if (!flowElement.dataOutputAssociations) return;
    for (let j = 0; j < idsInfo.length; j++) {
      const idInfo = idsInfo[j];
      for (let l = flowElement.dataOutputAssociations.length - 1; l >= 0; l--) {
        const doa = flowElement.dataOutputAssociations[l];
        if ((doa.sourceRef && doa.sourceRef.some(ref => ref.id === idInfo.orgFlowElementId)) ||
          (doa.targetRef && doa.targetRef.id === idInfo.orgFlowElementId)) {
          flowElement.dataOutputAssociations.splice(l, 1);
        }
      }
    }
  }

  // Association要素の削除
  // sourceRef.idまたはtargetRef.idが旧IDであるAssociationを削除
  function deleteAssociation(artifacts, idsInfo) {
    if (!artifacts || !idsInfo || !idsInfo.length) return;

    for (let i = artifacts.length - 1; i >= 0; i--) {
      const artifact = artifacts[i];
      if (artifact.$type === 'bpmn:Association' && (artifact.sourceRef || artifact.targetRef)) {
        if (idsInfo.some(idInfo => artifact.sourceRef.id === idInfo.orgFlowElementId || artifact.targetRef.id === idInfo.orgFlowElementId)) {
          artifacts.splice(i, 1);
        }
      }
    };
  };
};

async function main() {

  let args;
  // 引数解析
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    return;
  }

  const xml = fs.readFileSync(args.inputBpmnPath, 'utf8');

  //
  if (detectVendor(xml) === 'im-bpm') {
    // im-bpmはコピーのみ
    fs.copyFileSync(args.inputBpmnPath, args.outPutBpmnPath);
    process.exit(0);
    return;
  }

  // im-bpm 以外は、BPMN-XMLをim-bpm用に変換する
  let cleanedXml = cleanBpmnXml(xml);
  fromXML(cleanedXml).then(model => {
    convertImBpmModel(model);
    toXML(model).then(xml => {
      fs.writeFileSync(args.outPutBpmnPath, xml, 'utf8')
      process.exit(0);
    }).catch(toXMLError => {
      console.log('toXML Error ', toXMLError.message);
      process.exit(1);
      return;
    });
  }).catch(fromXMLError => {
    console.log('fromXML Error ', fromXMLError.message);
    process.exit(1);
    return;
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error('予期しないエラー:', err.message);
    process.exit(1);
  });
}
