# Source Of Truth

## Scope

From this point forward, the only accepted source of truth for automation work in this folder is:

- `E:\AIautomation\Testrelated\EasyCMS_后台管理_功能测试用例.md`
- `E:\AIautomation\Testrelated\EasyCMS_后台管理_接口测试用例.md`
- `E:\AIautomation\Testrelated\ui_pages_config\ui_pages.yaml`
- `E:\AIautomation\Testrelated\accounts_config\accounts.yaml`

## Explicit Exclusion

The following directory is treated as polluted and must not be used as an implementation reference:

- `E:\AIautomation\AI媒体管理系统\EasyCMS031901\tests\Auto_scripts`

This means:

- do not copy selectors, helpers, fixtures, or assertions from that directory
- do not treat scripts in that directory as a design baseline
- do not use that directory to justify future changes in `Testrelated`

## Allowed Inputs

When needed, the current running application itself may still be observed during execution, but coverage scope and script intent must always trace back to the test cases stored under `E:\AIautomation\Testrelated`.

## Maintenance Rule

Every new automated test added under:

- `E:\AIautomation\Testrelated\ui_automation`
- `E:\AIautomation\Testrelated\api_automation`

should point back to one or more case IDs from the test case documents.
