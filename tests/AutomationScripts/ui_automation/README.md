# UI Automation

## Purpose

This folder stores EasyCMS backend-management UI automation built from the test cases under `E:\AIautomation\Testrelated`.

## Source Rules

- Source of truth: `E:\AIautomation\Testrelated\EasyCMS_后台管理_功能测试用例.md`
- Shared config:
  - `..\ui_pages_config\ui_pages.yaml`
  - `..\accounts_config\accounts.yaml`
- Source isolation policy:
  - `..\SOURCE_OF_TRUTH.md`

## Test Structure

- `tests/test_smoke.py`
  - concentrated smoke suite
- `tests/test_regression.py`
  - formal/regression suite

## Reporting

After execution, the suite will generate:

- Chinese HTML report
- Chinese `buglist.md`
- failure screenshots in a dedicated `screenshots` folder

Output path pattern:

- `outputs\smoke\`
- `outputs\regression\`

## Core Files

- `conftest.py`: fixtures and report hooks
- `pages/*.py`: page objects
- `TRACEABILITY.md`: case-to-script mapping

## Install

```powershell
pip install -r requirements.txt
playwright install
```

## Run

You can run this folder directly with pytest, but it is recommended to use the root runner:

```powershell
python ..\run_all_tests.py --target ui --suite smoke
python ..\run_all_tests.py --target ui --suite regression
```
