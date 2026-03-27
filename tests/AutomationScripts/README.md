# Testrelated Workspace

## Purpose

This directory is the only accepted automation workspace for the current EasyCMS testing effort.

## Source Isolation

- All future automation work under this directory must use this directory as the only test-case source of truth.
- Do not use `E:\AIautomation\AI媒体管理系统\EasyCMS031901\tests\Auto_scripts` as an implementation reference.
- Detailed rule file: `SOURCE_OF_TRUTH.md`

## Main Assets

- `EasyCMS_后台管理_功能测试用例.md`
- `EasyCMS_后台管理_接口测试用例.md`
- `ui_pages_config\ui_pages.yaml`
- `accounts_config\accounts.yaml`
- `ui_automation\`
- `api_automation\`
- `run_all_tests.py`

## Current Environment

- UI base URL: `http://192.168.18.79:5173`
- Current account: `admin / Abc12345`

## Recommended Run Commands

```powershell
python run_all_tests.py --target ui --suite smoke
python run_all_tests.py --target ui --suite regression
python run_all_tests.py --target api --suite smoke
python run_all_tests.py --target api --suite regression
python run_all_tests.py --target all --suite all
```

## Report Output

UI reports:
- `ui_automation\outputs\smoke\`
- `ui_automation\outputs\regression\`

API reports:
- `api_automation\outputs\smoke\`
- `api_automation\outputs\regression\`

Each finished run is designed to generate:
- Chinese HTML report
- Chinese `buglist.md`
- UI failure screenshots under a dedicated `screenshots` folder
