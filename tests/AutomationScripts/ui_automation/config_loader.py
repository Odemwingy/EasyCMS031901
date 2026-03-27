from __future__ import annotations

from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[1]
CONFIG_ROOT = ROOT
UI_PAGES_FILE = CONFIG_ROOT / 'ui_pages_config' / 'ui_pages.yaml'
ACCOUNTS_FILE = CONFIG_ROOT / 'accounts_config' / 'accounts.yaml'


def _load_yaml(path: Path) -> dict:
    with path.open('r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def load_ui_pages() -> dict:
    return _load_yaml(UI_PAGES_FILE)


def load_accounts() -> dict:
    return _load_yaml(ACCOUNTS_FILE)


def get_admin_account() -> dict:
    return load_accounts()['accounts']['admin']


def get_page_url(page_key: str) -> str:
    return load_ui_pages()['pages'][page_key]['url']


def get_ui_base_url() -> str:
    return load_ui_pages()['environment']['ui_base_url'].rstrip('/')
