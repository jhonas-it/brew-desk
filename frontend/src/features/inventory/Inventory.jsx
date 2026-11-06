import { useState, useEffect } from "react";
import "./Inventory.css";
import { Fragment } from "react";
import {
  addBatch,
  addWasteLog,
  removeWasteLog,
  updateWasteLog,
  addIngredient,
  getIngredients,
  getWasteLog,
  updateIngredient,
  addReconciliation,
  getReconciliation,
  updateIngredientStock,
  getBatches,
} from "@/sevices/inventory.service";
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
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

const getBatchAlerts = (ingredient) => {
  let expired = 0;
  let expiringSoon = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  Object.values(ingredient.batches || {}).forEach((batch) => {
    const expirationDate = new Date(batch.expirationDate);

    if (Number(batch.quantity) <= 0) return;

    if (expirationDate < today) {
      expired++;
    } else if (expirationDate <= sevenDaysLater) {
      expiringSoon++;
    }
  });

  return { expired, expiringSoon };
};

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const isBatchExpired = (expirationDate) => {
    if (!expirationDate) return false;

    const expiration = new Date(
      `${String(expirationDate).slice(0, 10)}T00:00:00`,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return !isNaN(expiration.getTime()) && expiration < today;
  };
  const [activeTab, setActive] = useState("ingredients");
  const [existingWasteLog, setExistingWasteLog] = useState([]);
  const [existingIngredients, setExistingIngredients] = useState([]);
  useEffect(() => {
    getIngredients((data) => {
      setExistingIngredients(data);
    });
  }, []);
  useEffect(() => {
    getWasteLog((data) => {
      setExistingWasteLog(data);
    });
  }, []);
  const firstHeaderData = [
    {
      title: "Out of Stocks Items",
      subtitle: "Count of Items currently out of stock",
      value: existingIngredients.filter(
        (ingredient) =>
          ingredient.currentQuantity !== undefined &&
          Number(ingredient.currentQuantity) <= 0,
      ).length,
      bgColor: "#d5d5d5",
      icon: PackageOpen,
      iconColor: "black",
    },
    {
      title: "Expired Date",
      subtitle: "No. of Items past their expiration date",
      value: existingIngredients.reduce((total, ingredient) => {
        const batches = Object.values(ingredient.batches || {});

        const expiredBatches = batches.filter(
          (batch) =>
            isBatchExpired(batch.expirationDate) && Number(batch.quantity) > 0,
        );

        return total + expiredBatches.length;
      }, 0),
      bgColor: "#FDE4E4",
      icon: ClockAlert,
      iconColor: "#FF0000",
    },
    {
      title: "Low Stock Items",
      subtitle: "Count of Items that are running low",
      value: existingIngredients.filter((ingredient) => {
        const currentQuantity = Number(ingredient.currentQuantity);
        const parLevel = Number(ingredient.parLevel);

        return (
          ingredient.currentQuantity !== undefined &&
          currentQuantity > 0 &&
          currentQuantity <= parLevel
        );
      }).length,
      bgColor: "#FCF4EA",
      icon: Gauge,
      iconColor: "#FFA100",
    },
    {
      title: "Total Items",
      subtitle: "Total Items in Stock",
      value: existingIngredients.length,
      bgColor: "#E2FFDF",
      icon: Boxes,
      iconColor: "#017605",
    },
  ];

  const wasteHeaderData = [
    {
      title: "Expired",
      subtitle: "Entries Recorded",
      value: existingWasteLog.filter(
        (wasteLog) => wasteLog.reasonCode === "Expired",
      ).length,
      bgColor: "#FDE4E4",
      icon: ClockAlert,
      iconColor: "#FF0000",
    },
    {
      title: "Spillage",
      subtitle: "Entries Recorded",
      value: existingWasteLog.filter(
        (wasteLog) => wasteLog.reasonCode === "Spillage",
      ).length,
      bgColor: "#F7E4CA",
      icon: Droplet,
      iconColor: "#c38213",
    },
    {
      title: "Waste",
      subtitle: "Entries Recorded",
      value: existingWasteLog.filter(
        (wasteLog) => wasteLog.reasonCode === "Waste",
      ).length,
      bgColor: "#B8FFAE",
      icon: Recycle,
      iconColor: "#027706",
    },
    {
      title: "Others",
      subtitle: "Entries Recorded",
      value: existingWasteLog.filter(
        (wasteLog) => wasteLog.reasonCode === "Others",
      ).length,
      bgColor: "#cccccc",
      icon: Coffee,
      iconColor: "black",
    },
  ];

  const useHeaderData =
    activeTab === "waste" ? wasteHeaderData : firstHeaderData;
  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Keep track of your inventory and waste."
      />

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
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search inventory"
            />
          </div>
          <div className="table-header">
            <HeaderTable isWaste={activeTab === "waste"} />
          </div>
          <div className="table-records">
            <TableRecords isWaste={activeTab === "waste"} query={searchQuery} />
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

const TableRecords = ({ isWaste, query }) => {
  const [existingingredients, setExistingIngredients] = useState([]);
  const [existingWasteLog, setExistingWasteLog] = useState([]);
  const [expandedIngredient, setExpandedIngredient] = useState(null);
  const [existingBatches, setExistingBatches] = useState([]);
  const search = query.trim().toLowerCase();
  const filteredIngredients = existingingredients.filter((ingredient) => {
    const batchIds = Object.values(ingredient.batches || {})
      .map((batch) => batch.batchId)
      .join(" ");

    return [
      ingredient.ingredientName,
      ingredient.category,
      ingredient.unit,
      batchIds,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search),
    );
  });

  const filteredWasteLog = existingWasteLog.filter((wasteLog) => {
    return [
      wasteLog.ingredient,
      wasteLog.batch,
      wasteLog.reasonCode,
      wasteLog.loggedBy,
      wasteLog.note,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search),
    );
  });
  useEffect(() => {
    getIngredients((data) => {
      setExistingIngredients(data);
    });
  }, []);

  useEffect(() => {
    getWasteLog((data) => {
      setExistingWasteLog(data);
    });
  }, []);

  useEffect(() => {
    if (!expandedIngredient) {
      setExistingBatches([]);
      return;
    }

    const unsubscribe = getBatches(expandedIngredient, (data) => {
      setExistingBatches(data);
    });

    return () => {
      unsubscribe();
    };
  }, [expandedIngredient]);

  return (
    <>
      {isWaste ? (
        <>
          {filteredWasteLog.map((wasteLog) => (
            <Fragment key={wasteLog.id}>
              <span style={{ color: "#64748B" }}>
                {formatWasteTime(wasteLog.time)}
              </span>
              <span style={{ color: "#64748B" }}>{wasteLog.ingredient}</span>
              <span style={{ color: "#64748B" }}>{wasteLog.batch}</span>
              <span>Batch still Active</span>
              <span>{wasteLog.reasonCode}</span>
              <span>{wasteLog.loggedBy}</span>
              <span>{wasteLog.note}</span>
              <EditWasteReport wasteLog={wasteLog} />
            </Fragment>
          ))}
        </>
      ) : (
        <>
          {filteredIngredients.map((ingredient) => (
            <Fragment key={ingredient.id}>
              <div
                className="ingredient-cell"
                onClick={() => {
                  setExpandedIngredient(
                    expandedIngredient === ingredient.id ? null : ingredient.id,
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                {expandedIngredient === ingredient.id ? (
                  <ChevronDown size="15px" />
                ) : (
                  <ChevronRight size="15px" />
                )}

                <span>{ingredient.ingredientName}</span>
              </div>

              <span style={{ color: "#64748B" }}>{ingredient.category}</span>

              <span style={{ color: "#64748B" }}>{ingredient.unit}</span>

              <span style={{ fontWeight: "600" }}>
                {ingredient.currentQuantity || 0} {ingredient.unit}
              </span>

              <span style={{ color: "#64748B", fontWeight: "600" }}>
                {ingredient.parLevel}
              </span>

              <span className="flex flex-wrap items-center gap-2">
                {getBatchAlerts(ingredient).expired > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                    {getBatchAlerts(ingredient).expired} expired
                  </span>
                )}

                {getBatchAlerts(ingredient).expiringSoon > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                    {getBatchAlerts(ingredient).expiringSoon} expiring soon
                  </span>
                )}

                {getBatchAlerts(ingredient).expired === 0 &&
                  getBatchAlerts(ingredient).expiringSoon === 0 && (
                    <span>-----</span>
                  )}
              </span>

              <span style={{ fontWeight: "bold", color: "#64748B" }}>
                {Object.keys(ingredient.batches || {}).length} batches
              </span>

              <EditIngredientsAndBatches ingredient={ingredient} />

              {expandedIngredient === ingredient.id && (
                <div className="batch-accordion">
                  <div className="batch-accordion-header">
                    <span>Batch ID</span>
                    <span>Quantity</span>
                  </div>

                  {existingBatches.length > 0 ? (
                    existingBatches.map((batch) => (
                      <div className="batch-accordion-record" key={batch.id}>
                        <span>{batch.batchId}</span>

                        <span>
                          {batch.quantity} {batch.unit}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="batch-empty">
                      No batches recorded for this ingredient.
                    </div>
                  )}
                </div>
              )}
            </Fragment>
          ))}
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
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [physicalCount, setPhysicalCount] = useState("");

  useEffect(() => {
    getIngredients((data) => {
      setExistingIngredients(data);
    });
  }, []);

  const selectedIngredientData = existingIngredients.find(
    (ingredient) => ingredient.id === selectedIngredient,
  );

  const systemExpected = Number(selectedIngredientData?.currentQuantity || 0);

  const discrepancy = Number(physicalCount || 0) - systemExpected;

  const handleReconciliation = async (adjustStock) => {
    if (!selectedIngredientData || physicalCount === "") {
      alert("Please select an ingredient and enter the physical count.");
      return;
    }

    const date = new Date().toISOString();

    try {
      await addReconciliation(
        date,
        selectedIngredientData.id,
        selectedIngredientData.ingredientName,
        systemExpected,
        Number(physicalCount),
        discrepancy,
        "Unknown",
        selectedIngredientData.unit,
      );

      if (adjustStock) {
        await updateIngredientStock(
          selectedIngredientData.id,
          Number(physicalCount),
        );
      }

      setPhysicalCount("");
      console.log("Reconciliation recorded successfully!");
    } catch (error) {
      console.error("Error recording reconciliation:", error);
    }
  };

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

              <select
                name="ingredient-cb"
                id="ingredient-cb"
                value={selectedIngredient}
                onChange={(e) => {
                  setSelectedIngredient(e.target.value);
                  setPhysicalCount("");
                }}
              >
                <option value="">Select an ingredient...</option>

                {existingIngredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.ingredientName}
                  </option>
                ))}
              </select>

              <div className="recorded-quantity">
                <span>Recorded Quantity:</span>
                <strong>
                  {selectedIngredientData
                    ? `${systemExpected} ${selectedIngredientData.unit || ""}`
                    : "-"}
                </strong>
              </div>
            </div>

            <div className="physical-count">
              <span>Physical count</span>
              <input
                type="number"
                min="0"
                placeholder="Enter measured quantity"
                value={physicalCount}
                onChange={(e) => {
                  setPhysicalCount(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="bottom">
            <button
              type="button"
              className="record-adjust-btn"
              onClick={() => handleReconciliation(true)}
            >
              Record & Adjust Stock
            </button>

            <button
              type="button"
              className="count-only-btn"
              onClick={() => handleReconciliation(false)}
            >
              Record Count Only
            </button>
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
  const [existingReconciliation, setExistingReconciliation] = useState([]);

  useEffect(() => {
    getReconciliation((data) => {
      setExistingReconciliation(data.reverse());
    });
  }, []);

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
      {/* TODO: Add Pagination */}
      <div className="reconciliation-table-records">
        {existingReconciliation.map((reconciliation) => (
          <div className="reconciliation-record" key={reconciliation.id}>
            <span style={{ color: "#64748B" }}>
              {new Date(reconciliation.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            <span style={{ fontWeight: "bold", color: "#1E293B" }}>
              {reconciliation.ingredient}
            </span>

            <span style={{ color: "#475569" }}>
              {reconciliation.systemExpected} {reconciliation.unit}
            </span>

            <span style={{ color: "#1E293B" }}>
              {reconciliation.physicalCount} {reconciliation.unit}
            </span>

            <span
              style={{
                fontWeight: "bold",
                color:
                  reconciliation.discrepancy < 0
                    ? "#DC2626"
                    : reconciliation.discrepancy > 0
                      ? "#16A34A"
                      : "#64748B",
              }}
            >
              {reconciliation.discrepancy > 0 ? "+" : ""}
              {reconciliation.discrepancy} {reconciliation.unit}
            </span>
            <span style={{ color: "#334155" }}>{reconciliation.auditor}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const addIngredientFunction = async (
  ingredientName,
  category,
  unit,
  parLevel,
) => {
  try {
    await addIngredient(ingredientName, category, unit, parLevel);
  } catch (error) {
    console.log(error);
  }
};
const AddIngredientAction = () => {
  const [ingredient, setIngredient] = useState({
    name: "",
    category: "",
    unit: "",
    parLevel: 0,
  });

  const handleSubmit = async (e) => {
    (e.preventDefault(),
      await addIngredientFunction(
        ingredient.name,
        ingredient.category,
        ingredient.unit,
        ingredient.parLevel,
      ));
  };
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Plus size="15px" />
          Add Ingredients
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
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
                <span className="text-[#57534E] text-[12px] font-bold">
                  NAME
                </span>
                <input
                  onChange={(e) => {
                    setIngredient({ ...ingredient, name: e.target.value });
                  }}
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
                  onChange={(e) => {
                    setIngredient({ ...ingredient, category: e.target.value });
                  }}
                  name="category"
                  id="category"
                  className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2]"
                >
                  <option
                    value=""
                    className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2]"
                  >
                    Select category...
                  </option>
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
                    onChange={(e) => {
                      setIngredient({
                        ...ingredient,
                        unit: e.target.value,
                      });
                    }}
                    name="unit"
                    id="unit"
                    className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                  >
                    <option value="ml">ml (Mililiters)</option>
                    <option value="l">l (Liters)</option>
                    <option value="oz">oz (Ounces)</option>
                    <option value="g">g (Grams)</option>
                  </select>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-[12px] font-bold text-[#57534E]">
                    PAR LEVEL (ML)
                  </span>

                  <input
                    onChange={(e) => {
                      setIngredient({
                        ...ingredient,
                        parLevel: e.target.value,
                      });
                    }}
                    type="text"
                    placeholder="e.g. 3000"
                    className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-[12px] mt-8">
              <CloseModal />
              <button
                type="submit"
                className="border border-[#D6D3D1] px-[16px] h-[40px] rounded-[12px] text-[12px] text-[white] font-bold font-[#44403C] cursor-pointer bg-[#EA580C] hover:bg-[#B24B16]"
              >
                Add Ingredient
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

const formatWasteTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `Today ${formattedTime}`;
  }

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} ${formattedTime}`;
};

const addLogWaste = async (
  time,
  ingredient,
  batch,
  quantityLost,
  reasonCode,
  loggedBy,
  note,
  isUnknown,
) => {
  try {
    await addWasteLog(
      time,
      ingredient,
      batch,
      quantityLost,
      reasonCode,
      loggedBy,
      note,
      isUnknown,
    );
  } catch (error) {
    console.log(error);
  }
};

const LogWasteAction = () => {
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const { user } = useAuth();
  useEffect(() => {
    getIngredients((data) => {
      setExistingIngredients(data);
    });
  }, []);
  const [logWaste, setLogWaste] = useState({
    time: "",
    ingredient: "",
    batch: "",
    quantityLost: "",
    reasonCode: "",
    loggedBy: "",
    note: "",
    isUnknown: false,
  });
  const selectedIngredient = existingIngredients.find(
    (ingredient) => ingredient.ingredientName === logWaste.ingredient,
  );
  useEffect(() => {
    if (!selectedIngredient?.id) {
      setAvailableBatches([]);
      return;
    }

    const unsubscribe = getBatches(selectedIngredient.id, (data) => {
      setAvailableBatches(data);
    });

    return () => unsubscribe();
  }, [selectedIngredient?.id]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const time = new Date().toISOString();
    await addLogWaste(
      time,
      logWaste.ingredient,
      logWaste.batch,
      logWaste.quantityLost,
      logWaste.reasonCode,
      user?.name || "Unknown",
      logWaste.note,
      logWaste.isUnknown,
    );
  };
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
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-[#57534E] text-[12px] font-bold">
                  INGREDIENT
                </span>
                <select
                  value={logWaste.ingredient}
                  onChange={(e) => {
                    setLogWaste({
                      ...logWaste,
                      ingredient: e.target.value,
                      batch: "",
                    });
                  }}
                  name="ingredient"
                  id="ingredient"
                  className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                >
                  <option value="">Select an ingredient...</option>

                  {existingIngredients.map((ingredient) => (
                    <option
                      key={ingredient.id}
                      value={ingredient.ingredientName}
                    >
                      {ingredient.ingredientName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[#57534E] text-[12px] font-bold">
                  BATCH
                </span>
                <select
                  value={logWaste.batch}
                  onChange={(e) => {
                    setLogWaste({
                      ...logWaste,
                      batch: e.target.value,
                    });
                  }}
                  name="batch"
                  id="batch"
                  disabled={
                    !selectedIngredient || availableBatches.length === 0
                  }
                  className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                >
                  <option value="">
                    {!selectedIngredient
                      ? "Select an ingredient first..."
                      : availableBatches.length === 0
                        ? "No batches available"
                        : "Select a batch..."}
                  </option>

                  {availableBatches.map((batch) => (
                    <option key={batch.id} value={batch.batchId}>
                      {batch.batchId} - {batch.quantity} {batch.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-full gap-2">
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-[12px] font-bold text-[#57534E]">
                    QUNTITY LOST
                  </span>
                  <input
                    onChange={(e) => {
                      console.log(e.target.value);
                      setLogWaste({
                        ...logWaste,
                        quantityLost: e.target.value,
                      });
                    }}
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
                    onChange={(e) => {
                      console.log(e.target.value);
                      setLogWaste({ ...logWaste, reasonCode: e.target.value });
                    }}
                    name="reason"
                    id="reason"
                    className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Expired">Expired</option>
                    <option value="Waste">Waste</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
              <div className="flex text-[#64748B] text-[12px] gap-1 items-center">
                <input
                  type="checkbox"
                  className="w-[10px] h-[10px]"
                  onChange={(e) => {
                    console.log(e.target.checked);
                    setLogWaste({ ...logWaste, isUnknown: e.target.checked });
                  }}
                />
                <span>Quantity Unknown</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 my-5">
              <span className="text-[12px] font-bold text-[#57534E]">
                NOTE (OPTIONAL)
              </span>
              <input
                onChange={(e) => {
                  console.log(e.target.value);
                  setLogWaste({ ...logWaste, note: e.target.value });
                }}
                type="text"
                placeholder="e.g. Dropped during rush"
                className="w-full rounded-[12px] border-2 border-[#E2E8F0] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
              />
            </div>
            <div className="flex items-center justify-end gap-[12px] mt-8">
              <CloseModal />
              <button
                type="submit"
                className="border border-[#D6D3D1] px-[16px] h-[40px] rounded-[12px] text-[12px] text-[white] font-bold font-[#44403C] cursor-pointer bg-[#EA580C] hover:bg-[#B24B16]"
              >
                Log Waste
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

const CloseModal = () => {
  return (
    <DialogClose
      render={
        <button
          type="button"
          className="border border-[#D6D3D1] px-[20px] w-[90px] h-[40px] rounded-[12px] text-[14px] font-medium font-[#44403C] cursor-pointer hover:bg-[#C3C1C1]"
        >
          Cancel
        </button>
      }
    />
  );
};

// TODO: Hindi pa tapos to. Hindi sure kung pano gagawin

const RestockIngredientAction = () => {
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");

  const [restockData, setRestockData] = useState({
    quantityReceived: "",
    expirationDate: "",
    unit: "",
  });

  useEffect(() => {
    getIngredients((data) => {
      setExistingIngredients(data);
    });
  }, []);

  const selectedIngredient = existingIngredients.find(
    (ingredient) => ingredient.id === selectedIngredientId,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedIngredient) {
      alert("Please select an ingredient.");
      return;
    }

    if (
      restockData.quantityReceived === "" ||
      Number(restockData.quantityReceived) <= 0
    ) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (!restockData.expirationDate) {
      alert("Please select an expiration date.");
      return;
    }

    try {
      const batchId = await addBatch(
        selectedIngredient.id,
        restockData.quantityReceived,
        restockData.expirationDate,
        selectedIngredient.unit,
      );

      console.log(`Batch ${batchId} added successfully!`);

      setSelectedIngredientId("");

      setRestockData({
        quantityReceived: "",
        expirationDate: "",
        unit: "",
      });
    } catch (error) {
      console.error("Error adding batch:", error);
      alert("Failed to add batch. Please try again.");
    }
  };

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

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  INGREDIENT
                </span>

                <select
                  name="ingredient"
                  id="ingredient"
                  value={selectedIngredientId}
                  onChange={(e) => {
                    const ingredientId = e.target.value;

                    const selected = existingIngredients.find(
                      (ingredient) => ingredient.id === ingredientId,
                    );

                    setSelectedIngredientId(ingredientId);

                    setRestockData({
                      ...restockData,
                      unit: selected?.unit || "",
                    });
                  }}
                  className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                >
                  <option value="">Select an ingredient...</option>

                  {existingIngredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.ingredientName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  QUANTITY RECEIVED
                </span>

                <input
                  value={restockData.quantityReceived}
                  onChange={(e) => {
                    setRestockData({
                      ...restockData,
                      quantityReceived: e.target.value,
                    });
                  }}
                  type="number"
                  min="0"
                  placeholder="Enter quantity"
                  className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] outline-none focus:border-[#96bdf2]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-bold text-[#57534E]">
                  EXPIRATION DATE
                </span>

                <input
                  value={restockData.expirationDate}
                  onChange={(e) => {
                    setRestockData({
                      ...restockData,
                      expirationDate: e.target.value,
                    });
                  }}
                  type="date"
                  className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] text-[#44403C] outline-none focus:border-[#96bdf2]"
                />
              </div>

              <div className="flex w-full gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-[12px] font-bold text-[#57534E]">
                    UNIT
                  </span>

                  <select
                    value={restockData.unit}
                    disabled
                    name="unit"
                    id="unit"
                    className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] outline-none"
                  >
                    <option value="">Select an ingredient first</option>
                    <option value="ml">ml (Mililiters)</option>
                    <option value="l">l (Liters)</option>
                    <option value="oz">oz (Ounces)</option>
                    <option value="g">g (Grams)</option>
                  </select>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-[12px] font-bold text-[#57534E]">
                    CURRENT STOCK
                  </span>

                  <input
                    type="text"
                    disabled
                    value={
                      selectedIngredient
                        ? `${selectedIngredient.currentQuantity || 0} ${selectedIngredient.unit}`
                        : "-"
                    }
                    className="h-[50px] w-full rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] px-[14px] py-[12px] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-[12px]">
              <CloseModal />

              <button
                type="submit"
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
                Restock Ingredient
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EditIngredientsAndBatches = ({ ingredient }) => {
  const [formData, setFormData] = useState({
    ingredientName: ingredient.ingredientName || "",
    batchId: ingredient.batchId || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateIngredient(
        ingredient.id,
        formData.ingredientName,
        formData.batchId,
      );
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Dialog>
        <DialogTrigger className="text-[#64748B] text-[12px] font-bold border rounded-[8px] w-[46px] px-[10px] py-[4px] cursor-pointer">
          Edit
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
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
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      ingredientName: e.target.value,
                    });
                  }}
                  value={formData.ingredientName}
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
                  onChange={(e) => {
                    setFormData({ ...formData, batchId: e.target.value });
                  }}
                  value={formData.batchId}
                  type="text"
                  placeholder="e.g. #WM-0920"
                  className="px-[14px] py-[12px] border-2 border-[#E2E8F0] rounded-[12px] outline-none focus:border-[#96bdf2] text-[#A8A29E] font-[600]"
                />
              </div>
            </div>
            <div className="mt-8 flex items-center justify-end gap-[12px]">
              <CloseModal />

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
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EditWasteReport = ({ wasteLog }) => {
  const [formData, setFormData] = useState({
    ingredientName: wasteLog.ingredient || "",
    batchId: wasteLog.batch || "",
    reasonCode: wasteLog.reasonCode || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateWasteLog(
        wasteLog.id,
        formData.ingredientName,
        formData.batchId,
        formData.reasonCode,
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger className="text-[#64748B] text-[12px] font-bold border rounded-[8px] w-[46px] px-[10px] py-[4px] cursor-pointer">
          Edit
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader className="font-bold text-[23px] text-[#1E1B18]">
              Edit Waste Report
            </DialogHeader>
            <DialogDescription className="text-[#78716C]">
              {/* TODO: Create a new description for waste report */}
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
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      ingredientName: e.target.value,
                    });
                  }}
                  value={formData.ingredientName}
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
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      batchId: e.target.value,
                    });
                  }}
                  value={formData.batchId}
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
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      reasonCode: e.target.value,
                    });
                  }}
                  value={formData.reasonCode}
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
              <CloseModal />
              <DialogClose
                render={
                  <button
                    onClick={async () => {
                      await removeWasteLog(wasteLog.id);
                    }}
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
                }
              />
              <button
                type="submit"
                className="border border-[#D6D3D1] px-[16px] h-[40px] rounded-[12px] text-[12px] text-[white] font-bold font-[#44403C] cursor-pointer bg-[#EA580C] hover:bg-[#B24B16]"
              >
                Update Report
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Inventory;
