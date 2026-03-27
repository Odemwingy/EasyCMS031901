from __future__ import annotations

import re

from playwright.sync_api import Locator, Page


class LoginPage:
    def __init__(self, page: Page):
        self.page = page

    @property
    def username_input(self) -> Locator:
        return self.page.locator("#login-username")

    @property
    def password_input(self) -> Locator:
        return self.page.locator("#login-password")

    @property
    def remember_me_checkbox(self) -> Locator:
        return self.page.locator("input[type='checkbox']")

    @property
    def forgot_password_button(self) -> Locator:
        return self.page.get_by_text("忘记密码？")

    @property
    def login_button(self) -> Locator:
        return self.page.locator("button[type='submit']")

    @property
    def sso_button(self) -> Locator:
        return self.page.get_by_role("button", name="SSO 单点登录")

    @property
    def ldap_button(self) -> Locator:
        return self.page.get_by_role("button", name="LDAP 认证")

    def goto(self, url: str) -> None:
        self.page.goto(url, wait_until="domcontentloaded")

    def fill_credentials(self, username: str, password: str) -> None:
        self.username_input.fill(username)
        self.password_input.fill(password)

    def submit(self) -> None:
        self.login_button.click()

    def login(self, username: str, password: str) -> None:
        self.fill_credentials(username, password)
        self.submit()

    def wait_for_success_redirect(self) -> None:
        self.page.wait_for_function("() => window.location.pathname !== '/login'")
        self.page.wait_for_load_state("domcontentloaded")

    def success_toast(self) -> Locator:
        return self.page.get_by_text("登录成功", exact=True).last

    def invalid_credentials_feedback(self) -> Locator:
        return self.page.get_by_text("用户名或密码错误，请重新输入", exact=True).last
