from __future__ import annotations

import time
from typing import Any

import httpx


def unique_suffix() -> str:
    return str(int(time.time() * 1000))


def find_role_by_code(
    client: httpx.Client,
    headers: dict[str, str],
    code: str,
) -> dict[str, Any] | None:
    response = client.get(
        "/api/v1/admin/roles",
        headers=headers,
        params={"page": 1, "per_page": 100, "keyword": code},
    )
    response.raise_for_status()
    body = response.json()
    assert body["code"] == 0, body
    for role in body["data"]["list"]:
        if role["code"] == code:
            return role
    return None


def find_user_by_username(
    client: httpx.Client,
    headers: dict[str, str],
    username: str,
) -> dict[str, Any] | None:
    response = client.get(
        "/api/v1/admin/users",
        headers=headers,
        params={"page": 1, "per_page": 100, "keyword": username},
    )
    response.raise_for_status()
    body = response.json()
    assert body["code"] == 0, body
    for user in body["data"]["list"]:
        if user["username"] == username:
            return user
    return None


def find_menu_by_permission(
    client: httpx.Client,
    headers: dict[str, str],
    permission: str,
) -> dict[str, Any] | None:
    response = client.get(
        "/api/v1/admin/menus/tree",
        headers=headers,
        params={"include_disabled": True},
    )
    response.raise_for_status()
    body = response.json()
    assert body["code"] == 0, body

    def walk(nodes: list[dict[str, Any]]) -> dict[str, Any] | None:
        for node in nodes:
            if node["permission"] == permission:
                return node
            found = walk(node.get("children", []))
            if found:
                return found
        return None

    return walk(body["data"])


def create_role(
    client: httpx.Client,
    headers: dict[str, str],
    *,
    name_prefix: str = "auto_role_name",
    code_prefix: str = "auto_role",
    description: str = "created by automated API test",
    status: int = 1,
) -> dict[str, Any]:
    suffix = unique_suffix()
    payload = {
        "name": f"{name_prefix}_{suffix}",
        "code": f"{code_prefix}_{suffix}",
        "description": description,
        "status": status,
    }
    response = client.post("/api/v1/admin/roles", headers=headers, json=payload)
    response.raise_for_status()
    body = response.json()
    assert body["code"] == 0, body

    role_id = body["data"]["id"]
    detail_resp = client.get(f"/api/v1/admin/roles/{role_id}", headers=headers)
    detail_resp.raise_for_status()
    detail_body = detail_resp.json()
    assert detail_body["code"] == 0, detail_body
    return detail_body["data"]


def assign_role_permissions(
    client: httpx.Client,
    headers: dict[str, str],
    role_id: int,
    permissions: list[str],
) -> dict[str, Any]:
    response = client.put(
        f"/api/v1/admin/roles/{role_id}/permissions",
        headers=headers,
        json={"permissions": permissions},
    )
    response.raise_for_status()
    body = response.json()
    assert body["code"] == 0, body

    detail_resp = client.get(f"/api/v1/admin/roles/{role_id}/permissions", headers=headers)
    detail_resp.raise_for_status()
    detail_body = detail_resp.json()
    assert detail_body["code"] == 0, detail_body
    return detail_body["data"]


def delete_role_if_possible(client: httpx.Client, headers: dict[str, str], role_id: int) -> None:
    response = client.delete(f"/api/v1/admin/roles/{role_id}", headers=headers)
    if response.status_code >= 500:
        response.raise_for_status()


def delete_role_by_code_if_possible(client: httpx.Client, headers: dict[str, str], code: str) -> None:
    role = find_role_by_code(client, headers, code)
    if role:
        delete_role_if_possible(client, headers, role["id"])


def create_user(
    client: httpx.Client,
    headers: dict[str, str],
    *,
    role_ids: list[int],
    org_id: str = "org_auto",
    user_type: int = 1,
    password: str = "Abc12345",
    username_prefix: str = "auto_user",
    name_prefix: str = "auto_user_name",
    remark: str = "created by automated API test",
) -> dict[str, Any]:
    suffix = unique_suffix()
    payload = {
        "username": f"{username_prefix}_{suffix}",
        "name": f"{name_prefix}_{suffix}",
        "password": password,
        "user_type": user_type,
        "org_id": org_id,
        "role_ids": role_ids,
        "project_ids": [],
        "remark": remark,
    }
    response = client.post("/api/v1/admin/users", headers=headers, json=payload)
    response.raise_for_status()
    body = response.json()
    assert body["code"] == 0, body

    user_id = body["data"]["id"]
    detail_resp = client.get(f"/api/v1/admin/users/{user_id}", headers=headers)
    detail_resp.raise_for_status()
    detail_body = detail_resp.json()
    assert detail_body["code"] == 0, detail_body
    return detail_body["data"]


def disable_user(client: httpx.Client, headers: dict[str, str], user_id: int) -> None:
    response = client.patch(
        f"/api/v1/admin/users/{user_id}/status",
        headers=headers,
        json={"status": 2},
    )
    if response.status_code >= 500:
        response.raise_for_status()


def disable_user_by_username_if_possible(
    client: httpx.Client,
    headers: dict[str, str],
    username: str,
) -> None:
    user = find_user_by_username(client, headers, username)
    if user:
        disable_user(client, headers, user["id"])


def enable_user(client: httpx.Client, headers: dict[str, str], user_id: int) -> None:
    response = client.patch(
        f"/api/v1/admin/users/{user_id}/status",
        headers=headers,
        json={"status": 1},
    )
    if response.status_code >= 500:
        response.raise_for_status()


def create_menu(
    client: httpx.Client,
    headers: dict[str, str],
    *,
    parent_id: int | None = None,
    node_type: int = 2,
    name_prefix: str = "auto_menu_name",
    permission_prefix: str = "admin:auto",
    route_path_prefix: str = "/admin/auto",
    component: str = "features/auto/AutoPage",
    icon: str = "Settings",
    sort: int = 99,
    status: int = 1,
    remark: str = "created by automated API test",
) -> dict[str, Any]:
    suffix = unique_suffix()
    permission = f"{permission_prefix}:{suffix}:list" if node_type == 2 else f"{permission_prefix}:{suffix}:click"
    payload: dict[str, Any] = {
        "parent_id": parent_id,
        "type": node_type,
        "name": f"{name_prefix}_{suffix}",
        "permission": permission,
        "sort": sort,
        "status": status,
        "remark": remark,
    }
    if node_type == 2:
        payload["route_path"] = f"{route_path_prefix}-{suffix}"
        payload["component"] = component
        payload["icon"] = icon
    elif node_type == 1:
        payload["icon"] = icon

    response = client.post("/api/v1/admin/menus", headers=headers, json=payload)
    response.raise_for_status()
    body = response.json()
    assert body["code"] == 0, body

    menu_id = body["data"]["id"]
    tree_resp = client.get("/api/v1/admin/menus/tree", headers=headers, params={"include_disabled": True})
    tree_resp.raise_for_status()
    tree_body = tree_resp.json()
    assert tree_body["code"] == 0, tree_body

    def walk(nodes: list[dict[str, Any]]) -> dict[str, Any] | None:
        for node in nodes:
            if node["id"] == menu_id:
                return node
            found = walk(node.get("children", []))
            if found:
                return found
        return None

    found = walk(tree_body["data"])
    assert found is not None, tree_body
    return found


def delete_menu_if_possible(client: httpx.Client, headers: dict[str, str], menu_id: int) -> None:
    response = client.delete(f"/api/v1/admin/menus/{menu_id}", headers=headers)
    if response.status_code >= 500:
        response.raise_for_status()


def delete_menu_by_permission_if_possible(
    client: httpx.Client,
    headers: dict[str, str],
    permission: str,
) -> None:
    menu = find_menu_by_permission(client, headers, permission)
    if menu:
        delete_menu_if_possible(client, headers, menu["id"])


def create_role_with_bound_users(
    client: httpx.Client,
    headers: dict[str, str],
    *,
    active_count: int = 1,
    disabled_count: int = 1,
    role_name_prefix: str = "scenario_role_name",
    role_code_prefix: str = "scenario_role",
) -> dict[str, Any]:
    role = create_role(
        client,
        headers,
        name_prefix=role_name_prefix,
        code_prefix=role_code_prefix,
        description="created by scenario builder",
    )
    active_users: list[dict[str, Any]] = []
    disabled_users: list[dict[str, Any]] = []

    for _ in range(active_count):
        active_users.append(
            create_user(
                client,
                headers,
                role_ids=[role["id"]],
                username_prefix="scenario_active_user",
                name_prefix="scenario_active_user_name",
                remark="created by scenario builder",
            )
        )

    for _ in range(disabled_count):
        user = create_user(
            client,
            headers,
            role_ids=[role["id"]],
            username_prefix="scenario_disabled_user",
            name_prefix="scenario_disabled_user_name",
            remark="created by scenario builder",
        )
        disable_user(client, headers, user["id"])
        detail_resp = client.get(f"/api/v1/admin/users/{user['id']}", headers=headers)
        detail_resp.raise_for_status()
        detail_body = detail_resp.json()
        assert detail_body["code"] == 0, detail_body
        disabled_users.append(detail_body["data"])

    return {
        "role": role,
        "active_users": active_users,
        "disabled_users": disabled_users,
    }


def create_three_level_menu_tree(
    client: httpx.Client,
    headers: dict[str, str],
    *,
    name_prefix: str = "scenario_menu",
    permission_prefix: str = "admin:scenario-menu",
) -> dict[str, Any]:
    suffix = unique_suffix()
    root = create_menu(
        client,
        headers,
        parent_id=None,
        node_type=1,
        name_prefix=f"{name_prefix}_root",
        permission_prefix=f"{permission_prefix}:root:{suffix}",
    )
    menu = create_menu(
        client,
        headers,
        parent_id=root["id"],
        node_type=2,
        name_prefix=f"{name_prefix}_menu",
        permission_prefix=f"{permission_prefix}:menu:{suffix}",
        route_path_prefix=f"/admin/{name_prefix}-{suffix}",
    )
    button = create_menu(
        client,
        headers,
        parent_id=menu["id"],
        node_type=3,
        name_prefix=f"{name_prefix}_button",
        permission_prefix=f"{permission_prefix}:button:{suffix}",
    )
    return {
        "root": root,
        "menu": menu,
        "button": button,
        "all_nodes": [root, menu, button],
    }
