import { useState } from "react";
import "./Inventory.css";
import {
  PackageOpen,
  ClockAlert,
  Gauge,
  Boxes,
  Plus,
  Trash,
  Box,
  Droplet,
  Recycle,
  Coffee,
} from "lucide-react";

const Inventory = () => {
  const [activeTab, setActive] = useState("ingredients");

  const firstHeaderData = [
    {
      title: "Out of Stocks Items",
      subtitle: "Count of Items currently out of stock",
      value: "40",
      bgColor: "#d5d5d5",
      icon: PackageOpen,
      iconColor: "black",
    },
    {
      title: "Expired Date",
      subtitle: "No. of Items past their expiration date",
      value: "40",
      bgColor: "#FDE4E4",
      icon: ClockAlert,
      iconColor: "#FF0000",
    },
    {
      title: "Low Stock Items",
      subtitle: "No. of Items that are running low",
      value: "8",
      bgColor: "#FCF4EA",
      icon: Gauge,
      iconColor: "#FFA100",
    },
    {
      title: "Total Items",
      subtitle: "Total Items in Stock",
      value: "120",
      bgColor: "#E2FFDF",
      icon: Boxes,
      iconColor: "#017605",
    },
  ];

  const wasteHeaderData = [
    {
      title: "Expired",
      subtitle: "Entried Recorded",
      value: "4",
      bgColor: "#FDE4E4",
      icon: ClockAlert,
      iconColor: "#FF0000",
    },
    {
      title: "Spillage",
      subtitle: "Entried Recorded",
      value: "3",
      bgColor: "#F7E4CA",
      icon: Droplet,
      iconColor: "#c38213",
    },
    {
      title: "Waste",
      subtitle: "Entried Recorded",
      value: "2",
      bgColor: "#B8FFAE",
      icon: Recycle,
      iconColor: "#027706",
    },
    {
      title: "Others",
      subtitle: "Entried Recorded",
      value: "3",
      bgColor: "#cccccc",
      icon: Coffee,
      iconColor: "black",
    },
  ];

  const useHeaderData =
    activeTab === "waste" ? wasteHeaderData : firstHeaderData;
  return (
    <>
      <div className="header-inventory">
        {useHeaderData.map((item) => (
          <HeaderContainer
            title={item.title}
            subtitle={item.subtitle}
            value={item.value}
            bgColor={item.bgColor}
            icon={item.icon}
            iconColor={item.iconColor}
          />
        ))}
      </div>
      <div className="toolbar">
        <div className="inventory-tabs">
          <button
            className={activeTab === "ingredients" ? "active" : ""}
            onClick={() => setActive("ingredients")}
          >
            Ingredients & batches
          </button>
          <button
            className={activeTab === "waste" ? "active" : ""}
            onClick={() => setActive("waste")}
          >
            Waste report
          </button>
          <button
            className={activeTab === "stock" ? "active" : ""}
            onClick={() => setActive("stock")}
          >
            Stock reconciliation
          </button>
        </div>
        <div className="actions">
          <button>
            <Plus size="15px" />
            Add ingredients
          </button>
          <button>
            <Trash size="15px" /> Log waste
          </button>
          <button className="restock-btn">
            <Box size="15px" />
            Restock
          </button>
        </div>
      </div>
      <div className="table-wrapper">

      </div>
    </>
  );
};

const HeaderContainer = ({
  title,
  subtitle,
  value,
  bgColor,
  icon: Icon,
  iconColor,
}) => {
  return (
    <>
      <div className="inventory-header-container">
        <div className="inventory-header-container-title">
          <div style={{ backgroundColor: bgColor }} className="icon-container">
            <Icon strokeWidth={1} color={iconColor} />
          </div>
          <p>{title}</p>
        </div>
        <p className="container-info-subtitle">{subtitle}</p>
        <p className="container-info-result">{value}</p> {/* Ibahin to */}
      </div>
    </>
  );
};

export default Inventory;
