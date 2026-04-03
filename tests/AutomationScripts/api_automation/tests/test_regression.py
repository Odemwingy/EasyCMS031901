from __future__ import annotations

import pytest

from test_data import (
    assign_role_permissions,
    create_menu,
    create_role_with_bound_users,
    delete_menu_if_possible,
    delete_role_if_possible,
    disable_user,
)


@pytest.mark.case_ids("API-023")
@pytest.mark.bug_side("后端")
def test_me_returns_current_user_profile(client, auth_headers, admin_account):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    response.raise_for_status()
    payload = response.json()

    assert payload["code"] == 0
    assert payload["data"]["username"] == admin_account["username"]


@pytest.mark.case_ids("API-030", "API-031")
@pytest.mark.bug_side("后端")
def test_users_list_supports_keyword_and_combined_filters(client, auth_headers, created_role, created_user):
    keyword_response = client.get(
        "/api/v1/admin/users",
        headers=auth_headers,
        params={"page": 1, "per_page": 10, "keyword": created_user["username"]},
    )
    keyword_response.raise_for_status()
    keyword_payload = keyword_response.json()

    assert keyword_payload["code"] == 0
    assert any(user["username"] == created_user["username"] for user in keyword_payload["data"]["list"])

    combined_response = client.get(
        "/api/v1/admin/users",
        headers=auth_headers,
        params={
            "page": 1,
            "per_page": 10,
            "user_type": created_user["user_type"],
            "org_id": created_user["org_id"],
            "role_id": created_role["id"],
            "status": created_user["status"],
        },
    )
    combined_response.raise_for_status()
    combined_payload = combined_response.json()

    assert combined_payload["code"] == 0
    assert any(user["id"] == created_user["id"] for user in combined_payload["data"]["list"])


@pytest.mark.case_ids("API-032")
@pytest.mark.bug_side("后端")
def test_users_list_rejects_per_page_over_limit(client, auth_headers):
    response = client.get("/api/v1/admin/users", headers=auth_headers, params={"page": 1, "per_page": 101})
    assert response.status_code in (200, 400, 422)
    payload = response.json()

    assert payload["code"] == 1001


@pytest.mark.case_ids("API-034", "API-036")
@pytest.mark.bug_side("后端")
def test_created_user_can_be_queried(client, auth_headers, created_user):
    response = client.get(f"/api/v1/admin/users/{created_user['id']}", headers=auth_headers)
    response.raise_for_status()
    payload = response.json()

    assert payload["code"] == 0
    assert payload["data"]["id"] == created_user["id"]
    assert payload["data"]["username"] == created_user["username"]


@pytest.mark.case_ids("API-035")
@pytest.mark.bug_side("后端")
def test_query_nonexistent_user_returns_not_found(client, auth_headers):
    response = client.get("/api/v1/admin/users/999999", headers=auth_headers)
    assert response.status_code in (200, 404)
    payload = response.json()

    assert payload["code"] == 1004


@pytest.mark.case_ids("API-047")
@pytest.mark.bug_side("后端")
def test_disabled_user_detail_smoke(disabled_user):
    assert disabled_user["id"] > 0
    assert disabled_user["status"] in (0, 2)


@pytest.mark.case_ids("API-038")
@pytest.mark.bug_side("后端")
def test_create_user_duplicate_username_returns_validation_error(client, auth_headers):
    response = client.post(
        "/api/v1/admin/users",
        headers=auth_headers,
        json={
            "username": "admin",
            "name": "重复用户",
            "password": "Abc12345",
            "user_type": 1,
            "org_id": "org_001",
            "role_ids": [1],
            "project_ids": [],
        },
    )
    assert response.status_code in (200, 400, 409, 422)
    payload = response.json()

    assert payload["code"] == 1001
    assert "用户名已存在" in payload["message"]


@pytest.mark.case_ids("API-058")
@pytest.mark.bug_side("后端")
def test_query_nonexistent_role_returns_not_found(client, auth_headers):
    response = client.get("/api/v1/admin/roles/999999", headers=auth_headers)
    assert response.status_code in (200, 404)
    payload = response.json()

    assert payload["code"] == 1004


@pytest.mark.case_ids("API-057A", "API-057B")
@pytest.mark.bug_side("后端")
def test_role_detail_returns_user_status_counts(client, auth_headers):
    scenario = create_role_with_bound_users(client, auth_headers, active_count=1, disabled_count=1)
    try:
        response = client.get(f"/api/v1/admin/roles/{scenario['role']['id']}", headers=auth_headers)
        response.raise_for_status()
        payload = response.json()

        assert payload["code"] == 0
        assert payload["data"]["user_count"] == 2
        assert payload["data"]["active_user_count"] == 1
        assert payload["data"]["disabled_user_count"] == 1
    finally:
        for user in scenario["active_users"]:
            disable_user(client, auth_headers, user["id"])
        for user in scenario["disabled_users"]:
            disable_user(client, auth_headers, user["id"])
        delete_role_if_possible(client, auth_headers, scenario["role"]["id"])


@pytest.mark.case_ids("API-060", "API-061")
@pytest.mark.bug_side("后端")
def test_create_role_duplicate_name_and_code_return_validation_error(client, auth_headers):
    name_response = client.post(
        "/api/v1/admin/roles",
        headers=auth_headers,
        json={
            "name": "系统管理员",
            "code": "system_admin_copy_case",
            "description": "duplicate role name",
            "status": 1,
        },
    )
    assert name_response.status_code in (200, 400, 409, 422)
    name_payload = name_response.json()
    assert name_payload["code"] == 1001
    assert "角色名称已存在" in name_payload["message"]

    code_response = client.post(
        "/api/v1/admin/roles",
        headers=auth_headers,
        json={
            "name": "审核员副本",
            "code": "system_admin",
            "description": "duplicate role code",
            "status": 1,
        },
    )
    assert code_response.status_code in (200, 400, 409, 422)
    code_payload = code_response.json()
    assert code_payload["code"] == 1001
    assert "角色编码已存在" in code_payload["message"]


@pytest.mark.case_ids("API-064")
@pytest.mark.bug_side("后端")
def test_update_role_ignores_code_field(client, auth_headers, created_role):
    response = client.put(
        f"/api/v1/admin/roles/{created_role['id']}",
        headers=auth_headers,
        json={
            "name": created_role["name"],
            "description": "updated by regression test",
            "status": created_role["status"],
            "code": "changed_code_should_be_ignored",
        },
    )
    response.raise_for_status()
    payload = response.json()
    assert payload["code"] == 0

    detail_response = client.get(f"/api/v1/admin/roles/{created_role['id']}", headers=auth_headers)
    detail_response.raise_for_status()
    detail_payload = detail_response.json()

    assert detail_payload["code"] == 0
    assert detail_payload["data"]["code"] == created_role["code"]


@pytest.mark.case_ids("API-073")
@pytest.mark.bug_side("后端")
def test_new_role_permissions_default_to_empty_list(client, auth_headers, created_role):
    response = client.get(f"/api/v1/admin/roles/{created_role['id']}/permissions", headers=auth_headers)
    response.raise_for_status()
    payload = response.json()

    assert payload["code"] == 0
    assert payload["data"]["permissions"] == []


@pytest.mark.case_ids("API-074")
@pytest.mark.bug_side("后端")
def test_role_permissions_can_be_saved_and_read_back(client, auth_headers, created_role):
    permissions = [
        "admin:users:list",
        "admin:users:create",
    ]

    result = assign_role_permissions(client, auth_headers, created_role["id"], permissions)

    assert sorted(result["permissions"]) == sorted(permissions)


@pytest.mark.case_ids("API-077", "API-078")
@pytest.mark.bug_side("后端")
def test_menu_tree_include_disabled_flag_controls_disabled_nodes(client, auth_headers):
    disabled_menu = create_menu(client, auth_headers, node_type=1, status=2, name_prefix="disabled_menu_name")
    try:
        default_response = client.get("/api/v1/admin/menus/tree", headers=auth_headers)
        default_response.raise_for_status()
        default_payload = default_response.json()
        assert default_payload["code"] == 0

        include_response = client.get(
            "/api/v1/admin/menus/tree",
            headers=auth_headers,
            params={"include_disabled": True},
        )
        include_response.raise_for_status()
        include_payload = include_response.json()
        assert include_payload["code"] == 0

        def flatten(nodes):
            for node in nodes:
                yield node
                yield from flatten(node.get("children", []))

        default_ids = {node["id"] for node in flatten(default_payload["data"])}
        included_nodes = list(flatten(include_payload["data"]))
        included_ids = {node["id"] for node in included_nodes}

        assert disabled_menu["id"] not in default_ids
        assert disabled_menu["id"] in included_ids
        assert all("status" in node for node in included_nodes)
        assert all("status_label" in node for node in included_nodes)
    finally:
        delete_menu_if_possible(client, auth_headers, disabled_menu["id"])
