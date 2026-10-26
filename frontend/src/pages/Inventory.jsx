import "./Inventory.css";
import { PackageOpen } from "lucide-react";
import outOfStockItems from "../assets/out-of-stock-items.svg";
const Inventory = () => {
  return (
    <>
      <div className="header-inventory">
        <div className="inventory-header-container">
          <div className="inventory-header-container-title">
            <div className="icon-container">
              <PackageOpen strokeWidth={1} />
            </div>
            <p>Out of Stock Items</p>
          </div>
          <div>
            <p className="container-info-title">Count of Items currently out of stock</p>
            <p className="container-info-result">40</p> {/* Ibahin to */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Inventory;
