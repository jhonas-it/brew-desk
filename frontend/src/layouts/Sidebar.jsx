import brewDeskLogo from "../assets/images/brew desk icon.svg";
import {
    Flame,
    LayoutDashboard,
    ShoppingCart,
    Boxes,
    Package,
    UsersRound,
    Settings2,
    LogOut,
    ReceiptText,
} from "lucide-react";

import "./Sidebar.css";

const mainMenu = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["owner", "manager"],
    },
    {
        id: "pos",
        label: "POS",
        icon: ShoppingCart,
        roles: ["owner", "manager", "cashier"],
    },
    {
        id: "sales",
        label: "Sales",
        icon: ReceiptText,
        roles: ["owner", "manager", "cashier"],
    },

    {
        id: "inventory",
        label: "Inventory",
        icon: Boxes,
        roles: ["owner", "manager"],
    },
    {
        id: "products",
        label: "Products",
        icon: Package,
        roles: ["owner", "manager"],
    },
];

const managementMenu = [
    {
        id: "staffs",
        label: "Staffs",
        icon: UsersRound,
        roles: ["owner"],
    },
    {
        id: "settings",
        label: "Settings",
        icon: Settings2,
        roles: ["owner"],
    },
];

export default function Sidebar({
    activePage = "pos",
    onNavigate = () => { },
    onLogout = () => { },
    user = {
        name: "Allen Caraan",
        role: "owner",
        shiftActive: true,
    },
    queueCount = null,
}) {
    const role = String(user?.role || "cashier").toLowerCase();

    const renderMenu = (items) =>
        items
            .filter((item) => item.roles.includes(role))
            .map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                    <button
                        key={item.id}
                        type="button"
                        className={`bd-sidebar-link ${isActive ? "bd-sidebar-link-active" : ""
                            }`}
                        onClick={() => onNavigate(item.id)}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <Icon size={17} strokeWidth={1.8} />

                        <span>{item.label}</span>

                        {item.id === "pos" && queueCount !== null && (
                            <span className="bd-sidebar-count">
                                {queueCount}
                            </span>
                        )}
                    </button>
                );
            });

    return (
        <aside className="bd-sidebar">
            <div className="bd-sidebar-brand">
                <img
                    src={brewDeskLogo}
                    alt="Brew Desk Logo"
                    className="bd-brand-logo"
                />
                <span>Brew Desk</span>
            </div>
            <nav className="bd-sidebar-navigation">
                <p className="bd-sidebar-label">MAIN MENU</p>

                <div className="bd-sidebar-menu">
                    {renderMenu(mainMenu)}
                </div>

                {role === "owner" && (
                    <>
                        <p className="bd-sidebar-label bd-sidebar-label-spaced">
                            STORE MANAGEMENT
                        </p>

                        <div className="bd-sidebar-menu">
                            {renderMenu(managementMenu)}
                        </div>
                    </>
                )}
            </nav>

            <div className="bd-sidebar-footer">
                <div className="bd-sidebar-profile">
                    <div className="bd-profile-avatar">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="bd-profile-information">
                        <span className="bd-profile-name">
                            {user.name}
                        </span>

                        <div className="bd-profile-meta">
                            <span className="bd-profile-role">
                                {role.toUpperCase()}
                            </span>

                            <span className="bd-profile-shift">
                                {user.shiftActive
                                    ? "Shift Active"
                                    : "Shift Inactive"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="bd-sidebar-logout"
                        aria-label="Log out"
                        title="Log out"
                        onClick={onLogout}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
