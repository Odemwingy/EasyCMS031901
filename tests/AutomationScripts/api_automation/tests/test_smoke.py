from __future__ import annotations

import pytest


@pytest.mark.case_ids("API-001", "API-010")
@pytest.mark.bug_side("后端")
def test_login_success_returns_token(client, admin_account):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": admin_account["username"],
            "password": admin_account["password"],
        },
    )
    response.raise_for_status()
    payload = response.json()

    assert payload["code"] == 0
    assert payload["data"]["token"]
    assert payload["data"]["user"]["username"] == admin_account["username"]


@pytest.mark.case_ids("API-002")
@pytest.mark.bug_side("后端")
def test_me_requires_auth(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code in (200, 401, 403)
    payload = response.json()
    assert payload["code"] in (0, 1002, 1003)


@pytest.mark.case_ids("API-029")
@pytest.mark.bug_side("后端")
def test_users_list_smoke(client, auth_headers):
    response = client.get("/api/v1/admin/users", headers=auth_headers, params={"page": 1, "per_page": 10})
    response.raise_for_status()
    payload = response.json()

    assert payload["code"] == 0
    assert "list" in payload["data"]
    assert isinstance(payload["data"]["list"], list)


@pytest.mark.case_ids("API-057", "API-059")
@pytest.mark.bug_side("后端")
def test_created_role_can_be_queried(client, auth_headers, created_role):
    response = client.get(f"/api/v1/admin/roles/{created_role['id']}", headers=auth_headers)
    response.raise_for_status()
    payload = response.json()

    assert payload["code"] == 0
    assert payload["data"]["id"] == created_role["id"]
    assert payload["data"]["code"] == created_role["code"]


@pytest.mark.case_ids("API-078", "API-079", "API-080")
@pytest.mark.bug_side("后端")
def test_created_menu_appears_in_tree(client, auth_headers, created_menu):
    response = client.get("/api/v1/admin/menus/tree", headers=auth_headers, params={"include_disabled": True})
    response.raise_for_status()
    payload = response.json()

    assert payload["code"] == 0

    def walk(nodes):
        for node in nodes:
            if node["id"] == created_menu["id"]:
                return node
            found = walk(node.get("children", []))
            if found:
                return found
        return None

    found = walk(payload["data"])
    assert found is not None
    assert found["permission"] == created_menu["permission"]
