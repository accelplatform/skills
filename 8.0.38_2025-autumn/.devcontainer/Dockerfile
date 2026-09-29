FROM mcr.microsoft.com/devcontainers/java:dev-8-jdk-bookworm

# Playwright Chromium 実行時に必要な共有ライブラリ
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libxkbcommon0 libpango-1.0-0 libcairo2 libasound2 \
    libglib2.0-0 \
    fonts-ipafont \
    && rm -rf /var/lib/apt/lists/*

# vscode ユーザーに切り替え
USER vscode
