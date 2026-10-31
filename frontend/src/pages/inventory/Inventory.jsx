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
  Search,
  ChevronRight,
  FootprintsIcon,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
            isWaste={activeTab === "waste"}
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
          <AddIngredientAction />
          <LogWasteAction />
          <RestockIngredientAction />
        </div>
      </div>
      {activeTab !== "stock" ? (
        <div className="table-wrapper">
          <div className="search-container">
            <Search size="20px" color="#475569" />
            <input type="text" placeholder="Search products..." />
          </div>
          <div className="table-header">
            <HeaderTable isWaste={activeTab === "waste"} />
          </div>
          <div className="table-records">
            <TableRecords isWaste={activeTab === "waste"} />
          </div>
        </div>
      ) : (
        <>
          <StockReconciliation />
        </>
      )}
    </>
  );
};

const HeaderTable = ({ isWaste }) => {
  return (
    <>
      {isWaste ? (
        <>
          <span>DATE / TIME</span>
          <span>INGREDIENT</span>
          <span>BATCH #</span>
          <span>QUANTITY</span>
          <span>REASON</span>
          <span>LOGGED BY</span>
          <span>NOTE</span>
          <span>EDIT</span>
        </>
      ) : (
        <>
          <span>INGREDIENT</span>
          <span>CATEGORY</span>
          <span>UNIT</span>
          <span>
            REMAINING
            <br />
            (ACTIVE)
          </span>
          <span>
            PAR <br />
            LEVEL
          </span>
          <span>ALERTS</span>
          <span>
            BATCH
            <br />
            COUNT
          </span>
          <span>ACTIONS</span>
        </>
      )}
    </>
  );
};

const TableRecords = ({ isWaste }) => {
  return (
    <>
      {isWaste ? (
        <>
          <span style={{ color: "#64748B" }}>Today 09:15 AM</span>
          <span style={{ color: "#64748B" }}>Coffee</span>
          <span style={{ color: "#64748B" }}>#WM-0919</span>
          <span>Batch still Active</span>
          <span>1 expired</span>
          <span>Aquiera Cantillon</span>
          <span>Left in the shelf</span>
          <EditWasteReport />
        </>
      ) : (
        <>
          <div className="ingredient-cell">
            <ChevronRight size="15px" />
            <span>Espresso Beans</span>
          </div>
          <span style={{ color: "#64748B" }}>Coffee</span>
          <span style={{ color: "#64748B" }}>g</span>
          <span style={{ fontWeight: "600" }}>2,600 g</span>
          <span style={{ color: "#64748B", fontWeight: "600" }}>3,000 g</span>
          <span>1 expiring soon</span>
          <span style={{ fontWeight: "bold", color: "#64748B" }}>
            2 batches
          </span>
          {/* <span style={{ fontWeight: "bold", color: "#64748B" }}>Edit</span> */}
          <EditIngredientsAndBatches />
        </>
      )}
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
  isWaste,
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
        {isWaste ? (
          <>
            <p className="container-info-subtitle">{subtitle}</p>
            <p className="container-info-result">{value}</p> {/* Ibahin to */}
          </>
        ) : (
          <>
            <p className="container-info-result">{value}</p> {/* Ibahin to */}
            <p className="container-info-subtitle">{subtitle}</p>
          </>
        )}
      </div>
    </>
  );
};

const StockReconciliation = () => {
  return (
    <>
      <div className="stock-reconciliation">
        <div className="left-panel">
          <div className="top">
            <div className="title">
              <p style={{ fontWeight: "bold" }}>Physical Count</p>
              <p style={{ color: "#94A3B8", fontSize: "12px" }}>
                Compare shelf count to system expected stock.
              </p>
            </div>
            <div className="ingredient">
              <p
                style={{
                  color: "#334155",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                Ingredient
              </p>
              <select name="ingredient-cb" id="ingredient-cb">
                <option value="Espresso Beans">Espresso Beans</option>
                <option value="Mascaporne">Mascaporne</option>
                <option value="Frappe Base Powder">Frappe Base Powder</option>
              </select>
              <div className="recorded-quantity">
                <span>Recorded Quantity:</span>
                <strong>2,600 g</strong>
              </div>
            </div>
            <div className="physical-count">
              <span>Physical count (g)</span>
              <input type="number" placeholder="Enter measured quantity" />
            </div>
          </div>
          <div className="bottom">
            <button className="record-adjust-btn">Record & Adjust Stock</button>
            <button className="count-only-btn">Record Count Only</button>
          </div>
        </div>
        <section className="right-panel">
          <div className="header">
            <span style={{ fontWeight: "bold", fontSize: "14px" }}>
              Reconciliation History
            </span>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>
              Audit and discrepancy adjustments
            </span>
          </div>
          <hr style={{ border: "2px solid #F1F5F9" }} />
          <ReconciliationTable />
        </section>
      </div>
    </>
  );
};

const ReconciliationTable = () => {
  return (
    <>
      <div className="reconciliation-table-header">
        <span>DATE</span>
        <span>INGREDIENT</span>
        <span>
          SYSTEM <br /> EXPECTED
        </span>
        <span>
          PHYSICAL <br /> COUNT
        </span>
        <span>DISCREPANCY</span>
        <span>AUDITOR</span>
      </div>
      <div className="reconciliation-table-records">
        <span style={{ color: "#64748B" }}>
          Oct 20, <br /> 2024
        </span>
        <span style={{ fontWeight: "bold", color: "#1E293B" }}>
          Espreso Beans
        </span>
        <span style={{ color: "#475569" }}>2,750 g</span>
        <span style={{ color: "#1E293B" }}>2,600 g</span>
        <span style={{ fontWeight: "bold" }}>-150 g</span>
        <span style={{ color: "#334155" }}>
          Jhonas <br /> (Owner)
        </span>
      </div>
    </>
  );
};

const AddIngredientAction = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Plus size="15px" />
          Add Ingredients
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="font-bold text-[23px] text-[#1E1B18]">
            Add ingredient
          </DialogHeader>
          <DialogDescription className="text-[#78716C]">
            Par level is the normal stock you keep on hand. Low-stock alerts
            fire at a % of this.
          </DialogDescription>
          <hr />
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] text-[12px] font-bold">NAME</span>
              <input
                type="text"
                placeholder="e.g. Oat Milk"
                className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] text-[12px] font-bold">
                CATEGORY
              </span>
              <select
                name="category"
                id="category"
                className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2]"
              >
                <option
                  value="Dairy & Alternatives"
                  className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2]"
                >
                  Dairy & Alternatives
                </option>
              </select>
            </div>
            <div className="flex w-full gap-2">
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  UNIT
                </span>
                <select
                  name="unit"
                  id="unit"
                  className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                >
                  <option value="ml (Mililiters)">ml (Mililiters)</option>
                </select>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  PAR LEVEL (ML)
                </span>

                <input
                  type="text"
                  placeholder="e.g. 3000"
                  className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-[12px] mt-8">
            <button className="border border-[#D6D3D1] px-[20px] w-[90px] h-[40px] rounded-[12px] text-[14px] font-medium font-[#44403C] cursor-pointer hover:bg-[#C3C1C1]">
              Cancel
            </button>
            <button className="border border-[#D6D3D1] px-[16px] h-[40px] rounded-[12px] text-[12px] text-[white] font-bold font-[#44403C] cursor-pointer bg-[#EA580C] hover:bg-[#B24B16]">
              Add Ingredient
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const LogWasteAction = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Trash size="15px" /> Log waste
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="font-bold text-[23px] text-[#1E1B18]">
            Log waste / spoilage
          </DialogHeader>
          <DialogDescription className="text-[#78716C]">
            Removes the lost quantity from the selected batch and records it in
            the Waste Report.
          </DialogDescription>
          <hr />
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] text-[12px] font-bold">
                INGREDIENT
              </span>
              <select
                name="ingredient"
                id="ingredient"
                className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
              >
                <option value="Espresso Beans">Espresso Beans</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] text-[12px] font-bold">
                BATCH
              </span>
              <select
                name="batch"
                id="batch"
                className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
              >
                <option value="Select a batch...">Select a batch...</option>
              </select>
            </div>
            <div className="flex w-full gap-2">
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  QUNTITY LOST
                </span>
                <input
                  type="text"
                  placeholder="e.g. 3000"
                  className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  REASON CODE
                </span>
                <select
                  name="reason"
                  id="reason"
                  className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                >
                  <option value="Spillage">Spillage</option>
                </select>
              </div>
            </div>
            <div className="flex text-[#64748B] text-[12px] gap-1 items-center">
              <input type="checkbox" className="w-[10px] h-[10px]" />
              <span>Quantity Unknown</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <span className="text-[12px] font-bold text-[#57534E]">
              NOTE (OPTIONAL)
            </span>
            <input
              type="text"
              placeholder="e.g. Dropped during rush"
              className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
            />
          </div>
          <div className="flex items-center justify-end gap-[12px] mt-8">
            <button className="border border-[#D6D3D1] px-[20px] w-[90px] h-[40px] rounded-[12px] text-[14px] font-medium font-[#44403C] cursor-pointer hover:bg-[#C3C1C1]">
              Cancel
            </button>
            <button className="border border-[#D6D3D1] px-[16px] h-[40px] rounded-[12px] text-[12px] text-[white] font-bold font-[#44403C] cursor-pointer bg-[#EA580C] hover:bg-[#B24B16]">
              Log Waste
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const RestockIngredientAction = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger
          render={
            <button className="flex h-[40px] items-center gap-2 rounded-[12px] !bg-[#EA580C] px-[16px] text-[12px] font-bold !text-white hover:!bg-[#B24B16]" />
          }
        >
          <Box size="15px" />
          Restock
        </DialogTrigger>

        <DialogContent>
          <DialogHeader className="text-[23px] font-bold text-[#1E1B18]">
            Restock ingredient
          </DialogHeader>

          <DialogDescription className="text-[#78716C]">
            Creates a new batch. Existing batches are kept as is.
          </DialogDescription>

          <hr />

          <div className="flex flex-col gap-5">
            {/* INGREDIENT */}
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#57534E]">
                INGREDIENT
              </span>

              <select
                name="ingredient"
                id="ingredient"
                className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
              >
                <option value="Espresso Beans">Espresso beans</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#57534E]">
                QUANTITY RECEIVED (G)
              </span>

              <input
                type="number"
                placeholder=""
                className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
              />
            </div>

            {/* EXPIRATION DATE */}
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#57534E]">
                EXPIRATION DATE
              </span>

              <input
                type="date"
                className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] text-[#44403C] outline-none focus:border-[#96bdf2]"
              />
            </div>

            <div className="flex w-full gap-4">
              {/* UNIT */}
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  UNIT
                </span>

                <select
                  name="unit"
                  id="unit"
                  className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                >
                  <option value="ml">ml (Mililiters)</option>
                </select>
              </div>

              {/* PAR LEVEL */}
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  PAR LEVEL (ML)
                </span>

                <input
                  type="number"
                  placeholder="e.g. 3000"
                  className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-[12px]">
            <button
              className="
                h-[40px] w-[100px]
                rounded-[12px]
                border border-[#D6D3D1]
                bg-white
                px-[20px]
                text-[14px]
                font-medium
                text-[#44403C]
                cursor-pointer
                hover:bg-[#C3C1C1]
              "
            >
              Cancel
            </button>

            <button
              className="
                h-[40px]
                rounded-[12px]
                border border-[#D6D3D1]
                bg-[#EA580C]
                px-[16px]
                text-[12px]
                font-bold
                text-white
                cursor-pointer
                hover:bg-[#B24B16]
              "
            >
              Add Ingredient
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EditIngredientsAndBatches = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger className="text-[#64748B] text-[12px] font-bold border rounded-[8px] w-[46px] px-[10px] py-[4px] cursor-pointer">
          Edit
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="font-bold text-[23px] text-[#1E1B18]">
            Edit ingredients & batches
          </DialogHeader>
          <DialogDescription className="text-[#78716C]">
            Log new incoming stock batches and adjust active batch details for
            this specific ingredient below.
          </DialogDescription>
          <hr />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] font-bold text-[12px]">
                PRODUCT NAME
              </span>
              <input
                type="text"
                placeholder="e.g. Americano"
                className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2] text-[#A8A29E] font-[600]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] font-bold text-[12px]">
                BATCH ID
              </span>
              <input
                type="text"
                placeholder="e.g. #WM-0920"
                className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2] text-[#A8A29E] font-[600]"
              />
            </div>
          </div>
          <div className="mt-8 flex items-center justify-end gap-[12px]">
            <button
              className="
                h-[40px] w-[100px]
                rounded-[12px]
                border border-[#D6D3D1]
                bg-white
                px-[20px]
                text-[14px]
                font-medium
                text-[#44403C]
                cursor-pointer
                hover:bg-[#C3C1C1]
              "
            >
              Cancel
            </button>

            <button
              className="
                h-[40px]
                rounded-[12px]
                border border-[#D6D3D1]
                bg-[#EA580C]
                px-[16px]
                text-[12px]
                font-bold
                text-white
                cursor-pointer
                hover:bg-[#B24B16]
              "
            >
              Add Ingredient
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EditWasteReport = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger className="text-[#64748B] text-[12px] font-bold border rounded-[8px] w-[46px] px-[10px] py-[4px] cursor-pointer">
          Edit
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="font-bold text-[23px] text-[#1E1B18]">
            Edit ingredients & batches
          </DialogHeader>
          <DialogDescription className="text-[#78716C]">
            Log new incoming stock batches and adjust active batch details for
            this specific ingredient below.
          </DialogDescription>
          <hr />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] font-bold text-[12px]">
                PRODUCT NAME
              </span>
              <input
                type="text"
                placeholder="e.g. Americano"
                className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2] text-[#A8A29E] font-[600]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] font-bold text-[12px]">
                BATCH ID
              </span>
              <input
                type="text"
                placeholder="e.g. #WM-0920"
                className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2] text-[#A8A29E] font-[500]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#57534E] font-bold text-[12px]">
                REASON
              </span>
              <select
                name="reason-cb"
                id="reason-cb"
                className="text-[12px] font-[600] w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
              >
                <option value="Expired">Expired</option>
                <option value="Spillage">Spillage</option>
                <option value="Waste">Waste</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-[12px]">
            <button
              className="
                h-[40px] w-[100px]
                rounded-[12px]
                border border-[#D6D3D1]
                bg-white
                px-[20px]
                text-[14px]
                font-medium
                text-[#44403C]
                cursor-pointer
                hover:bg-[#C3C1C1]
              "
            >
              Cancel
            </button>

            <button
              className="
                w-[117px]
                h-[40px]
                rounded-[12px]
                border border-[#D6D3D1]
                bg-[#E00509]
                px-[16px]
                text-[12px]
                font-bold
                text-white
                cursor-pointer
                hover:bg-[#960306]
              "
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Inventory;
