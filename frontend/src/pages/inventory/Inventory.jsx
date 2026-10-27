import "./Inventory.css";
import { PackageOpen, ClockAlert, Gauge, Boxes } from "lucide-react";

const Inventory = () => {
  return (
    <>
      <div className="header-inventory">
        <HeaderContainer
          title="Out of Stocks Items"
          subtitle="Count of Items currently out of stock"
          value="40"
          bgColor="#d5d5d5"
          icon={PackageOpen}
          iconColor="black"
        />
        <HeaderContainer
          title="Expired Date"
          subtitle="No. of Items past their expiration date"
          value="40"
          bgColor="#FDE4E4"
          icon={ClockAlert}
          iconColor="#FF0000"
        />
        <HeaderContainer
          title="Low Stock Items"
          subtitle="No. of Items that are running low"
          value="8"
          bgColor="#FCF4EA"
          icon={Gauge}
          iconColor="#FFA100"
        />
        <HeaderContainer
          title="Total Items"
          subtitle="Total Items in Stock"
          value="120"
          bgColor="#E2FFDF"
          icon={Boxes}
          iconColor="#017605"
        />
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
