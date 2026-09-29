# Flow Function Settings (flowSettings)

Control IM-Workflow flow definition function settings with the `flowSettings` object in `spec.json`.
Default values apply when omitted.

```jsonc
{
  "flowSettings": {
    "lumpProcess": true,            // Bulk processing (default: true)
    "attachFile": false,            // File attachments (default: true)
    "confirmUserSetup": false,      // Confirmer setup (default: false)
    "completedMatterConfirm": true, // Confirm completed cases (default: false)
    "autoProcess": false,           // Auto processing (default: false)
    "autoProcessLimitDay": null,    // Auto processing deadline days (set when autoProcess=true)
    "autoProcessLimitType": null,   // Post-deadline action type: 0=approve/1=deny/2=return (default when autoProcess=true: 0)
    "autoPress": false,             // Auto reminder (default: false)
    "autoPressLimitDay": null,      // Auto reminder deadline days (set when autoPress=true)
    "asyncProcess": false,          // Async processing (default: false)
    "sysDateTargetExpand": false,   // Target expansion date: true=processing date/false=case start date (default: false)
    "calendarId": null              // Calendar ID (default: null=standard calendar)
  }
}
```

| Field | XML Tag | Default | Description |
|---|---|---|---|
| `lumpProcess` | `lumpProcessFlag` | `true` | Whether to use bulk processing |
| `attachFile` | `attachFileFlag` | `true` | Whether to use file attachments |
| `confirmUserSetup` | `confirmUserSetupFlag` | `false` | Whether to use confirmer setup |
| `completedMatterConfirm` | `completeMatterConfirmFlag` | `false` | Confirm completed cases |
| `autoProcess` | `autoProcessFlag` | `false` | Whether to use auto processing |
| `autoProcessLimitDay` | `autoProcessLimitDay` | `null` | Auto processing deadline days |
| `autoProcessLimitType` | `autoProcessLimitType` | `0` (when autoProcess=true) | Post-deadline action: 0=approve, 1=deny, 2=return |
| `autoPress` | `autoPressFlag` | `false` | Whether to use auto reminders |
| `autoPressLimitDay` | `autoPressLimitDay` | `null` | Auto reminder deadline days |
| `asyncProcess` | `asyncProcessFlag` | `false` | Whether to use async processing |
| `sysDateTargetExpand` | `sysDateTargetExpandFlag` | `false` | Target expansion date (false=case start date, true=processing date) |
| `calendarId` | `calendarId` | `null` | Calendar ID (null=standard calendar) |

**Note:** The following settings are outside the scope of the import XML and require manual configuration in the admin screen:
- Prevent applicant from self-approving (`applyUserApprovePreventFlag`)
- Case operation authorized persons (`handleUsers` is output as an empty array)
- Default organizations (`defaultOrgzs` is output as an empty array)
