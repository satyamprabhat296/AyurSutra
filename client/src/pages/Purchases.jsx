import { useEffect, useState } from "react";
import {
  getPurchases,
  createPurchase,
} from "../services/purchaseService";
import { getMedicines } from "../services/medicineService";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    supplier: "",
    purchaseDate: new Date()
      .toISOString()
      .split("T")[0],
    paymentStatus: "PENDING",
    paymentMethod: "CASH",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      medicine: "",
      medicineName: "",
      quantity: 1,
      purchasePrice: 0,
      gst: 0,
      batchNumber: "",
      expiryDate: "",
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [purchaseData, medicineData] =
        await Promise.all([
          getPurchases(),
          getMedicines(),
        ]);

      setPurchases(
        purchaseData.purchases || []
      );

      setMedicines(
        medicineData.medicines || []
      );
    } catch (error) {
      console.error(
        "Failed to load purchase data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    setItems((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  const handleMedicineChange = (
    index,
    medicineId
  ) => {
    const medicine = medicines.find(
      (item) => item._id === medicineId
    );

    setItems((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        medicine: medicineId,
        medicineName:
          medicine?.medicineName || "",
        purchasePrice:
          medicine?.purchasePrice || 0,
        gst: medicine?.gst || 0,
      };

      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        medicine: "",
        medicineName: "",
        quantity: 1,
        purchasePrice: 0,
        gst: 0,
        batchNumber: "",
        expiryDate: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems((prev) =>
      prev.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const calculateItemTotal = (item) => {
    const quantity =
      Number(item.quantity) || 0;

    const price =
      Number(item.purchasePrice) || 0;

    const gst =
      Number(item.gst) || 0;

    const base = quantity * price;

    return base + (base * gst) / 100;
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) =>
        total + calculateItemTotal(item),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplier.trim()) {
      alert("Please enter supplier name.");
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.medicine ||
        Number(item.quantity) < 1 ||
        Number(item.purchasePrice) < 0
    );

    if (invalidItem) {
      alert(
        "Please enter valid medicine, quantity and purchase price."
      );
      return;
    }

    try {
      setSubmitting(true);

      await createPurchase({
        ...form,
        items: items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          purchasePrice: Number(
            item.purchasePrice
          ),
          gst: Number(item.gst || 0),
        })),
      });

      alert(
        "Purchase created successfully."
      );

      setForm({
        supplier: "",
        purchaseDate: new Date()
          .toISOString()
          .split("T")[0],
        paymentStatus: "PENDING",
        paymentMethod: "CASH",
        notes: "",
      });

      setItems([
        {
          medicine: "",
          medicineName: "",
          quantity: 1,
          purchasePrice: 0,
          gst: 0,
          batchNumber: "",
          expiryDate: "",
        },
      ]);

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to create purchase."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Purchases
        </h1>

        <p className="text-gray-500">
          Manage medicine purchases and stock
          entries.
        </p>
      </div>

      {/* Purchase Form */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-5">
          Create Purchase
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Supplier
              </label>

              <input
                type="text"
                name="supplier"
                value={form.supplier}
                onChange={handleFormChange}
                placeholder="Supplier name"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Purchase Date
              </label>

              <input
                type="date"
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Status
              </label>

              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="PARTIAL">
                  Partial
                </option>

                <option value="PAID">
                  Paid
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="CASH">
                  Cash
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="CARD">
                  Card
                </option>

                <option value="BANK_TRANSFER">
                  Bank Transfer
                </option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                Medicines
              </h3>

              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                + Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Medicine */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Medicine
                      </label>

                      <select
                        value={item.medicine}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            e.target.value
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="">
                          Select medicine
                        </option>

                        {medicines.map(
                          (medicine) => (
                            <option
                              key={medicine._id}
                              value={medicine._id}
                            >
                              {
                                medicine.medicineName
                              }{" "}
                              (
                              {
                                medicine.medicineCode
                              }
                              )
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Purchase Price */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Purchase Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          item.purchasePrice
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "purchasePrice",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* GST */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        GST %
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={item.gst}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "gst",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Batch */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Batch Number
                      </label>

                      <input
                        type="text"
                        value={
                          item.batchNumber
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "batchNumber",
                            e.target.value
                          )
                        }
                        placeholder="Batch"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Expiry */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Expiry Date
                      </label>

                      <input
                        type="date"
                        value={
                          item.expiryDate
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "expiryDate",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Item Total */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Item Total
                      </label>

                      <div className="border rounded-lg px-3 py-2 bg-gray-50">
                        ₹
                        {calculateItemTotal(
                          item
                        ).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        disabled={
                          items.length === 1
                        }
                        className="w-full px-3 py-2 rounded-lg bg-red-500 text-white disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
              rows="3"
              placeholder="Purchase notes..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-gray-500">
                Grand Total
              </p>

              <p className="text-2xl font-bold">
                ₹{calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create Purchase"}
            </button>
          </div>
        </form>
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Purchase History
        </h2>

        {loading ? (
          <p>Loading purchases...</p>
        ) : purchases.length === 0 ? (
          <p className="text-gray-500">
            No purchases found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">
                    Purchase No.
                  </th>

                  <th className="p-3">
                    Supplier
                  </th>

                  <th className="p-3">
                    Date
                  </th>

                  <th className="p-3">
                    Items
                  </th>

                  <th className="p-3">
                    Total
                  </th>

                  <th className="p-3">
                    Payment
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchases.map(
                  (purchase) => (
                    <tr
                      key={purchase._id}
                      className="border-b"
                    >
                      <td className="p-3 font-medium">
                        {
                          purchase.purchaseNumber
                        }
                      </td>

                      <td className="p-3">
                        {purchase.supplier}
                      </td>

                      <td className="p-3">
                        {purchase.purchaseDate
                          ? new Date(
                              purchase.purchaseDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-3">
                        {purchase.items?.length ||
                          0}
                      </td>

                      <td className="p-3 font-semibold">
                        ₹
                        {Number(
                          purchase.total || 0
                        ).toFixed(2)}
                      </td>

                      <td className="p-3">
                        {purchase.paymentStatus}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;