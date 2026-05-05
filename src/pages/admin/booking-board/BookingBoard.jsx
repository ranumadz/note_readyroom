import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "readylog_workspace_live_v2";

const DEFAULT_BRANCHES = [
  { id: 1, name: "ReadyRoom Gancit", code: "GANCIT", color: "#FFB703" },
  { id: 2, name: "ReadyRoom Anggrek", code: "ANGGREK", color: "#EF233C" },
  { id: 3, name: "ReadyRoom Madu", code: "MADU", color: "#8338EC" },
];

const BRANCH_COLORS = [
  "#FFB703",
  "#EF233C",
  "#06D6A0",
  "#3A86FF",
  "#8338EC",
  "#FB5607",
  "#8AC926",
  "#FF006E",
];

const TABLE_TEMPLATES = [
  {
    key: "booking_manual",
    name: "Booking Manual",
    color: "#FFB703",
    fields: [
      { key: "date", label: "Tanggal", type: "date", required: true },
      { key: "name", label: "Nama", type: "text", required: true },
      { key: "phone", label: "No HP", type: "text", required: true },
      { key: "time", label: "Jam", type: "time" },
      { key: "room", label: "No. Kamar", type: "text", required: true },
      {
        key: "type",
        label: "F/T",
        type: "select",
        options: ["3 Jam", "6 Jam", "12 Jam", "Full", "Charge"],
      },
      { key: "price", label: "Harga", type: "money", required: true },
      {
        key: "payment",
        label: "Payment",
        type: "select",
        options: ["cash", "qris", "tf"],
      },
      { key: "petugas", label: "Petugas", type: "text" },
      { key: "note", label: "Ket", type: "textarea" },
    ],
  },
  {
    key: "operasional",
    name: "Operasional",
    color: "#06D6A0",
    fields: [
      { key: "date", label: "Tanggal", type: "date", required: true },
      { key: "title", label: "Judul", type: "text", required: true },
      {
        key: "category",
        label: "Kategori",
        type: "select",
        options: ["Belanja", "Kendala Shift", "Kebutuhan Cabang", "Lainnya"],
      },
      { key: "nominal", label: "Nominal", type: "money" },
      {
        key: "payment",
        label: "Payment",
        type: "select",
        options: ["cash", "qris", "tf", "-"],
      },
      { key: "petugas", label: "Petugas", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["open", "pending", "done"],
      },
      { key: "note", label: "Keterangan", type: "textarea" },
    ],
  },
  {
    key: "pln_token",
    name: "PLN / Token",
    color: "#3A86FF",
    fields: [
      { key: "date", label: "Tanggal", type: "date", required: true },
      { key: "meter", label: "No Meter / Token", type: "text" },
      { key: "nominal", label: "Nominal", type: "money", required: true },
      {
        key: "payment",
        label: "Payment",
        type: "select",
        options: ["cash", "qris", "tf"],
      },
      { key: "petugas", label: "Petugas", type: "text" },
      { key: "note", label: "Keterangan", type: "textarea" },
    ],
  },
  {
    key: "maintenance",
    name: "Maintenance Kamar",
    color: "#EF233C",
    fields: [
      { key: "date", label: "Tanggal", type: "date", required: true },
      { key: "room", label: "Kamar", type: "text", required: true },
      { key: "issue", label: "Masalah", type: "textarea", required: true },
      {
        key: "priority",
        label: "Prioritas",
        type: "select",
        options: ["low", "medium", "urgent"],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["open", "progress", "done"],
      },
      { key: "petugas", label: "Petugas", type: "text" },
      { key: "note", label: "Keterangan", type: "textarea" },
    ],
  },
  {
    key: "kas_kecil",
    name: "Kas Kecil",
    color: "#8338EC",
    fields: [
      { key: "date", label: "Tanggal", type: "date", required: true },
      { key: "item", label: "Item", type: "text", required: true },
      { key: "nominal", label: "Nominal", type: "money", required: true },
      {
        key: "payment",
        label: "Payment",
        type: "select",
        options: ["cash", "qris", "tf"],
      },
      { key: "petugas", label: "Petugas", type: "text" },
      { key: "note", label: "Keterangan", type: "textarea" },
    ],
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function makeBranchCode(name = "") {
  return (
    name
      .trim()
      .toUpperCase()
      .replace(/READYROOM/g, "")
      .replace(/READY ROOM/g, "")
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "CABANG"
  );
}

function getTemplate(key) {
  return (
    TABLE_TEMPLATES.find((template) => template.key === key) ||
    TABLE_TEMPLATES[0]
  );
}

function buildDefaultTables(branches) {
  return branches.flatMap((branch) =>
    TABLE_TEMPLATES.slice(0, 4).map((template) => ({
      id: `${branch.id}_${template.key}`,
      branchId: branch.id,
      key: template.key,
      name:
        template.key === "booking_manual"
          ? `Bookingan ${branch.code}`
          : template.key === "operasional"
          ? `Operasional ${branch.code}`
          : template.name,
      color: template.color,
    }))
  );
}

function buildInitialWorkspace() {
  return {
    branches: DEFAULT_BRANCHES,
    tables: buildDefaultTables(DEFAULT_BRANCHES),
    rows: [],
  };
}

function buildEmptyForm(template) {
  const form = {};

  template.fields.forEach((field) => {
    if (field.type === "date") form[field.key] = today();
    else if (field.type === "select") form[field.key] = field.options?.[0] || "";
    else form[field.key] = "";
  });

  return form;
}

function getNominal(row) {
  return Number(row.price || row.nominal || 0);
}

function getBranchName(branches, branchId) {
  return (
    branches.find((branch) => Number(branch.id) === Number(branchId))?.name ||
    "-"
  );
}

function getFieldWidth(field) {
  if (field.key === "note") return 360;
  if (field.key === "issue") return 340;
  if (field.key === "title") return 300;
  if (field.key === "name") return 220;
  if (field.key === "phone") return 180;
  if (field.key === "date") return 155;
  if (field.key === "time") return 130;
  if (field.key === "room") return 145;
  if (field.type === "money") return 170;
  if (field.type === "select") return 165;
  return 190;
}

function getTableMinWidth(fields) {
  const baseColumns = 150;
  const fieldsWidth = fields.reduce(
    (sum, field) => sum + getFieldWidth(field),
    0
  );

  return Math.max(1280, baseColumns + fieldsWidth);
}

function formatPrintValue(value, field) {
  if (field.type === "money") return `Rp ${money(value)}`;
  if (!value) return "-";
  return String(value);
}

export default function BookingBoard() {
  const [theme, setTheme] = useState("light");

  const [workspace, setWorkspace] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(STORAGE_KEY));
    return saved || buildInitialWorkspace();
  });

  const [selectedBranch, setSelectedBranch] = useState(
    workspace.branches[0] ? String(workspace.branches[0].id) : "all"
  );

  const [activeTableId, setActiveTableId] = useState(
    workspace.tables[0] ? workspace.tables[0].id : ""
  );

  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const [showDataModal, setShowDataModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
  });

  const [tableForm, setTableForm] = useState({
    templateKey: "operasional",
    name: "",
  });

  const selectedBranchData = useMemo(() => {
    if (selectedBranch === "all") return null;

    return workspace.branches.find(
      (branch) => Number(branch.id) === Number(selectedBranch)
    );
  }, [workspace.branches, selectedBranch]);

  const branchTables = useMemo(() => {
    if (selectedBranch === "all") return [];

    return workspace.tables.filter(
      (table) => Number(table.branchId) === Number(selectedBranch)
    );
  }, [workspace.tables, selectedBranch]);

  const activeTable = useMemo(() => {
    return (
      workspace.tables.find((table) => table.id === activeTableId) ||
      branchTables[0] ||
      workspace.tables[0] ||
      null
    );
  }, [workspace.tables, activeTableId, branchTables]);

  const activeTemplate = getTemplate(activeTable?.key);

  const [form, setForm] = useState(() => buildEmptyForm(activeTemplate));

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return workspace.rows.filter((row) => {
      const branchMatch =
        selectedBranch === "all"
          ? true
          : Number(row.branchId) === Number(selectedBranch);

      const tableMatch = activeTable ? row.tableId === activeTable.id : true;

      const searchMatch = q
        ? Object.values(row).join(" ").toLowerCase().includes(q)
        : true;

      return branchMatch && tableMatch && searchMatch;
    });
  }, [workspace.rows, selectedBranch, activeTable, search]);

  const selectedData = visibleRows.filter((row) => selectedRows.includes(row.id));

  const totalNominal = visibleRows.reduce(
    (sum, row) => sum + getNominal(row),
    0
  );

  const totalCash = visibleRows.filter((row) => row.payment === "cash").length;
  const totalQris = visibleRows.filter((row) => row.payment === "qris").length;
  const totalTf = visibleRows.filter((row) => row.payment === "tf").length;

  const c = getTheme(theme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    setSelectedRows([]);

    if (selectedBranch !== "all") {
      const firstTable = workspace.tables.find(
        (table) => Number(table.branchId) === Number(selectedBranch)
      );

      if (firstTable) setActiveTableId(firstTable.id);
    }
  }, [selectedBranch, workspace.tables]);

  useEffect(() => {
    setForm(buildEmptyForm(activeTemplate));
  }, [activeTable?.id]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "price" || field === "nominal"
          ? value.replace(/[^\d]/g, "")
          : value,
    }));
  };

  const handleCellChange = (rowId, field, value) => {
    setWorkspace((prev) => ({
      ...prev,
      rows: prev.rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]:
                field === "price" || field === "nominal"
                  ? value.replace(/[^\d]/g, "")
                  : value,
            }
          : row
      ),
    }));
  };

  const handleAddData = (event) => {
    event.preventDefault();

    if (!activeTable || selectedBranch === "all") {
      alert("Pilih cabang dan table dulu.");
      return;
    }

    for (const field of activeTemplate.fields) {
      if (field.required && !String(form[field.key] || "").trim()) {
        alert(`${field.label} wajib diisi.`);
        return;
      }
    }

    const newRow = {
      id: Date.now(),
      branchId: Number(selectedBranch),
      tableId: activeTable.id,
      ...form,
      price: Number(form.price || 0),
      nominal: Number(form.nominal || 0),
      createdAt: new Date().toISOString(),
    };

    setWorkspace((prev) => ({
      ...prev,
      rows: [newRow, ...prev.rows],
    }));

    setShowDataModal(false);
    setForm(buildEmptyForm(activeTemplate));
  };

  const handleAddBranch = (event) => {
    event.preventDefault();

    const name = branchForm.name.trim();
    const code = branchForm.code.trim() || makeBranchCode(name);

    if (!name) {
      alert("Nama cabang wajib diisi.");
      return;
    }

    const nextId =
      Math.max(0, ...workspace.branches.map((branch) => Number(branch.id))) + 1;

    const newBranch = {
      id: nextId,
      name,
      code,
      color: BRANCH_COLORS[workspace.branches.length % BRANCH_COLORS.length],
    };

    const defaultTables = buildDefaultTables([newBranch]);

    setWorkspace((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
      tables: [...prev.tables, ...defaultTables],
    }));

    setSelectedBranch(String(nextId));
    setActiveTableId(defaultTables[0]?.id || "");
    setBranchForm({ name: "", code: "" });
    setShowBranchModal(false);
  };

  const handleAddTable = (event) => {
    event.preventDefault();

    if (selectedBranch === "all") {
      alert("Pilih cabang dulu sebelum tambah table.");
      return;
    }

    const template = getTemplate(tableForm.templateKey);
    const name = tableForm.name.trim() || template.name;

    const newTable = {
      id: `${selectedBranch}_${template.key}_${Date.now()}`,
      branchId: Number(selectedBranch),
      key: template.key,
      name,
      color: template.color,
    };

    setWorkspace((prev) => ({
      ...prev,
      tables: [...prev.tables, newTable],
    }));

    setActiveTableId(newTable.id);
    setTableForm({ templateKey: "operasional", name: "" });
    setShowTableModal(false);
  };

  const handleSelectAll = () => {
    setSelectedRows(visibleRows.map((row) => row.id));
  };

  const handleResetSelection = () => {
    setSelectedRows([]);
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handlePrintSelected = () => {
    if (selectedData.length === 0) {
      alert("Pilih dulu data yang mau dicetak.");
      return;
    }

    const selectedTotal = selectedData.reduce(
      (sum, row) => sum + getNominal(row),
      0
    );

    const cashRows = selectedData.filter((row) => row.payment === "cash");
    const qrisRows = selectedData.filter((row) => row.payment === "qris");
    const tfRows = selectedData.filter((row) => row.payment === "tf");

    const cashTotal = cashRows.reduce((sum, row) => sum + getNominal(row), 0);
    const qrisTotal = qrisRows.reduce((sum, row) => sum + getNominal(row), 0);
    const tfTotal = tfRows.reduce((sum, row) => sum + getNominal(row), 0);

    const headers = activeTemplate.fields
      .map((field) => `<th>${field.label}</th>`)
      .join("");

    const rows = selectedData
      .map((row, index) => {
        const cells = activeTemplate.fields
          .map((field) => {
            return `<td>${formatPrintValue(row[field.key], field)}</td>`;
          })
          .join("");

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${getBranchName(workspace.branches, row.branchId)}</td>
            <td>${activeTable?.name || "-"}</td>
            ${cells}
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      alert("Popup diblokir browser.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>ReadyLog PDF</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 0;
              margin: 0;
              color: #111827;
              background: #ffffff;
            }

            .page {
              padding: 18px;
            }

            h1 {
              margin: 0;
              font-size: 28px;
              letter-spacing: -1px;
            }

            .meta {
              margin-top: 6px;
              font-size: 12px;
              color: #475569;
              line-height: 1.5;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(6, minmax(0, 1fr));
              gap: 8px;
              margin: 16px 0;
            }

            .box {
              border: 2px solid #111827;
              border-radius: 10px;
              padding: 10px;
              background: #f8fafc;
            }

            .label {
              font-size: 10px;
              font-weight: bold;
              color: #475569;
              text-transform: uppercase;
            }

            .value {
              margin-top: 5px;
              font-size: 15px;
              font-weight: 900;
              line-height: 1.3;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: auto;
              font-size: 10px;
            }

            th,
            td {
              border: 1px solid #111827;
              padding: 6px;
              text-align: left;
              vertical-align: top;
              white-space: normal;
              word-break: break-word;
            }

            th {
              background: #FFB703;
              color: #111827;
              font-weight: 900;
            }

            td {
              line-height: 1.35;
            }

            .footer {
              margin-top: 12px;
              font-size: 10px;
              color: #64748b;
            }
          </style>
        </head>

        <body>
          <div class="page">
            <h1>ReadyLog</h1>

            <div class="meta">
              Cabang: ${selectedBranchData?.name || "Semua Cabang"}<br/>
              Table: ${activeTable?.name || "-"}<br/>
              Tanggal cetak: ${today()}
            </div>

            <div class="summary">
              <div class="box">
                <div class="label">Total Data</div>
                <div class="value">${selectedData.length}</div>
              </div>

              <div class="box">
                <div class="label">Total Nominal</div>
                <div class="value">Rp ${money(selectedTotal)}</div>
              </div>

              <div class="box">
                <div class="label">Cash</div>
                <div class="value">${cashRows.length} data<br/>Rp ${money(
      cashTotal
    )}</div>
              </div>

              <div class="box">
                <div class="label">QRIS</div>
                <div class="value">${qrisRows.length} data<br/>Rp ${money(
      qrisTotal
    )}</div>
              </div>

              <div class="box">
                <div class="label">TF</div>
                <div class="value">${tfRows.length} data<br/>Rp ${money(
      tfTotal
    )}</div>
              </div>

              <div class="box">
                <div class="label">Workspace</div>
                <div class="value">ReadyRoom</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Cabang</th>
                  <th>Table</th>
                  ${headers}
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="footer">
              Dokumen ini dicetak dari ReadyLog internal workspace.
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "none",
        background: c.bg,
        color: c.text,
        fontFamily: 'Inter, Arial, "Segoe UI", sans-serif',
        overflowX: "hidden",
      }}
    >
      <style>
        {`
          html,
          body,
          #root {
            width: 100% !important;
            max-width: none !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: ${c.bg} !important;
            overflow-x: hidden !important;
            text-align: left !important;
          }

          * {
            box-sizing: border-box;
          }

          input,
          select,
          textarea,
          button {
            font-family: inherit;
          }

          button:active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0 ${c.ink} !important;
          }

          .readylog-mobile-list {
            display: none;
          }

          .readylog-chip-row {
            scrollbar-width: thin;
          }

          .readylog-chip-row::-webkit-scrollbar {
            height: 6px;
          }

          .readylog-chip-row::-webkit-scrollbar-thumb {
            background: ${c.ink};
            border-radius: 999px;
          }

          @media (max-width: 900px) {
            .readylog-container {
              padding: 14px !important;
            }

            .readylog-panel {
              border-radius: 16px !important;
              box-shadow: 5px 5px 0 ${c.ink} !important;
            }

            .readylog-header-inner {
              align-items: stretch !important;
            }

            .readylog-brand-row {
              width: 100% !important;
              align-items: flex-start !important;
            }

            .readylog-title {
              font-size: 26px !important;
            }

            .readylog-subtitle {
              font-size: 12px !important;
              line-height: 1.45 !important;
            }

            .readylog-actions {
              width: 100% !important;
              display: grid !important;
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 10px !important;
            }

            .readylog-actions button {
              width: 100% !important;
              justify-content: center !important;
            }

            .readylog-chip-row {
              flex-wrap: nowrap !important;
              overflow-x: auto !important;
              padding-bottom: 8px !important;
              margin-right: -6px !important;
              -webkit-overflow-scrolling: touch !important;
            }

            .readylog-chip-row button {
              flex: 0 0 auto !important;
            }

            .readylog-filter {
              grid-template-columns: 1fr 1fr !important;
            }

            .readylog-filter input {
              grid-column: 1 / -1 !important;
            }

            .readylog-filter button {
              width: 100% !important;
            }

            .readylog-form-grid {
              grid-template-columns: 1fr !important;
            }

            .readylog-summary {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .readylog-modal-box {
              max-width: calc(100vw - 28px) !important;
              padding: 14px !important;
              border-radius: 18px !important;
              box-shadow: 6px 6px 0 ${c.ink} !important;
            }
          }

          @media (max-width: 760px) {
            .readylog-desktop-table {
              display: none !important;
            }

            .readylog-mobile-list {
              display: grid !important;
              gap: 12px !important;
              margin-top: 16px !important;
            }

            .readylog-mobile-card {
              background: ${c.panel};
              border: 2px solid ${c.ink};
              border-radius: 16px;
              box-shadow: 5px 5px 0 ${c.ink};
              padding: 14px;
            }

            .readylog-mobile-card-head {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              margin-bottom: 12px;
              padding-bottom: 10px;
              border-bottom: 2px solid ${c.ink};
            }

            .readylog-mobile-number {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 34px;
              height: 34px;
              border: 2px solid ${c.ink};
              border-radius: 999px;
              background: #FFB703;
              color: #111827;
              font-weight: 950;
              box-shadow: 3px 3px 0 ${c.ink};
            }

            .readylog-mobile-fields {
              display: grid;
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .readylog-mobile-field-label {
              display: block;
              font-size: 11px;
              font-weight: 950;
              color: ${c.sub};
              text-transform: uppercase;
              margin-bottom: 5px;
              letter-spacing: 0.04em;
            }
          }

          @media (max-width: 520px) {
            .readylog-container {
              padding: 10px !important;
            }

            .readylog-title {
              font-size: 24px !important;
            }

            .readylog-logo {
              width: 46px !important;
              height: 46px !important;
              font-size: 16px !important;
            }

            .readylog-actions {
              grid-template-columns: 1fr !important;
            }

            .readylog-filter {
              grid-template-columns: 1fr !important;
            }

            .readylog-summary {
              grid-template-columns: 1fr !important;
            }

            .readylog-section-title {
              font-size: 15px !important;
            }

            .readylog-section-sub {
              font-size: 12px !important;
            }
          }
        `}
      </style>

      <div className="readylog-container" style={container}>
        <section
          className="readylog-panel"
          style={{ ...neoPanel(c), padding: "18px", background: c.header }}
        >
          <div className="readylog-header-inner" style={topbar}>
            <div
              className="readylog-brand-row"
              style={{ display: "flex", alignItems: "center", gap: "14px" }}
            >
              <div className="readylog-logo" style={logoBox(c)}>
                RL
              </div>

              <div>
                <div className="readylog-title" style={title}>
                  ReadyLog
                </div>

                <div
                  className="readylog-subtitle"
                  style={{ color: c.sub, fontSize: "13px", fontWeight: 800 }}
                >
                  Internal workspace cabang, table operasional, dan laporan
                  ReadyRoom.
                </div>
              </div>
            </div>

            <div className="readylog-actions" style={actionsWrap}>
              <button
                onClick={() => setShowBranchModal(true)}
                style={neoButton(c, "#FFB703")}
              >
                + Cabang
              </button>

              <button
                onClick={() => setShowTableModal(true)}
                style={neoButton(c, "#8AC926")}
              >
                + Table
              </button>

              <button
                onClick={() => setShowDataModal(true)}
                style={neoButton(c, "#06D6A0")}
              >
                + Data
              </button>

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={neoButton(c, c.muted)}
              >
                {theme === "dark" ? "☀ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>
        </section>

        <section
          className="readylog-panel"
          style={{ ...neoPanel(c), padding: "16px", marginTop: "16px" }}
        >
          <div className="readylog-section-title" style={sectionTitle}>
            Folder Cabang
          </div>

          <div className="readylog-section-sub" style={sectionSub}>
            Pilih cabang, lalu pilih table yang mau diisi.
          </div>

          <div className="readylog-chip-row" style={chipWrap}>
            {workspace.branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(String(branch.id))}
                style={branchChip(
                  c,
                  selectedBranch === String(branch.id),
                  branch.color
                )}
              >
                {branch.code}
              </button>
            ))}
          </div>
        </section>

        <section
          className="readylog-panel"
          style={{
            ...neoPanel(c),
            padding: "16px",
            marginTop: "16px",
            background: c.panel2,
          }}
        >
          <div className="readylog-section-title" style={sectionTitle}>
            Table {selectedBranchData ? selectedBranchData.name : ""}
          </div>

          <div className="readylog-section-sub" style={sectionSub}>
            Isi table ini bisa dibuat untuk booking manual, operasional, PLN,
            maintenance, dan kas kecil.
          </div>

          <div className="readylog-chip-row" style={chipWrap}>
            {branchTables.length === 0 ? (
              <div style={{ fontWeight: 900, color: c.sub }}>
                Belum ada table di cabang ini.
              </div>
            ) : (
              branchTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setActiveTableId(table.id)}
                  style={tableChip(c, activeTableId === table.id, table.color)}
                >
                  {table.name}
                </button>
              ))
            )}
          </div>
        </section>

        <section
          className="readylog-panel"
          style={{ ...neoPanel(c), padding: "14px", marginTop: "16px" }}
        >
          <div className="readylog-filter" style={filterGrid}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, no hp, kamar, petugas, keterangan..."
              style={neoInput(c)}
            />

            <button onClick={handleSelectAll} style={neoButton(c, c.muted)}>
              Pilih Semua
            </button>

            <button onClick={handleResetSelection} style={neoButton(c, c.muted)}>
              Reset Pilihan
            </button>

            <button onClick={handlePrintSelected} style={neoButton(c, "#06D6A0")}>
              Cetak PDF
            </button>
          </div>
        </section>

        <section
          className="readylog-panel readylog-desktop-table"
          style={{ ...neoPanel(c), marginTop: "16px", overflow: "hidden" }}
        >
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "max-content",
                minWidth: `${getTableMinWidth(activeTemplate.fields)}px`,
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...th(c), width: "70px" }}>Pilih</th>
                  <th style={{ ...th(c), width: "70px" }}>No</th>
                  {activeTemplate.fields.map((field) => (
                    <th
                      key={field.key}
                      style={{
                        ...th(c),
                        minWidth: `${getFieldWidth(field)}px`,
                      }}
                    >
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTemplate.fields.length + 2}
                      style={{
                        ...td(c),
                        textAlign: "center",
                        padding: "44px 20px",
                        color: c.sub,
                        fontWeight: 950,
                      }}
                    >
                      Belum ada data. Klik tombol + Data untuk mulai input.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, index) => {
                    const isSelected = selectedRows.includes(row.id);

                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: isSelected
                            ? c.selected
                            : index % 2 === 0
                            ? c.row
                            : c.rowAlt,
                        }}
                      >
                        <td style={td(c)}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            style={{
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                            }}
                          />
                        </td>

                        <td style={{ ...td(c), fontWeight: 950 }}>
                          {index + 1}
                        </td>

                        {activeTemplate.fields.map((field) => (
                          <td
                            key={field.key}
                            style={{
                              ...td(c),
                              minWidth: `${getFieldWidth(field)}px`,
                              whiteSpace: "normal",
                            }}
                          >
                            <EditableCell
                              c={c}
                              field={field}
                              value={row[field.key]}
                              onChange={(value) =>
                                handleCellChange(row.id, field.key, value)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="readylog-mobile-list">
          {visibleRows.length === 0 ? (
            <div className="readylog-mobile-card">
              <div style={{ fontWeight: 950, color: c.sub }}>
                Belum ada data. Klik tombol + Data untuk mulai input.
              </div>
            </div>
          ) : (
            visibleRows.map((row, index) => {
              const isSelected = selectedRows.includes(row.id);

              return (
                <div
                  key={row.id}
                  className="readylog-mobile-card"
                  style={{
                    background: isSelected ? c.selected : c.panel,
                  }}
                >
                  <div className="readylog-mobile-card-head">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="readylog-mobile-number">{index + 1}</span>

                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 950 }}>
                          {activeTable?.name || "Table"}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: c.sub }}>
                          {selectedBranchData?.name || "-"}
                        </div>
                      </div>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "12px",
                        fontWeight: 950,
                      }}
                    >
                      Pilih
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(row.id)}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                    </label>
                  </div>

                  <div className="readylog-mobile-fields">
                    {activeTemplate.fields.map((field) => (
                      <div key={field.key}>
                        <span className="readylog-mobile-field-label">
                          {field.label}
                        </span>

                        <EditableCell
                          c={c}
                          field={field}
                          value={row[field.key]}
                          mobile
                          onChange={(value) =>
                            handleCellChange(row.id, field.key, value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="readylog-summary" style={summaryGrid}>
          <SummaryCard c={c} label="Total Data" value={visibleRows.length} />
          <SummaryCard c={c} label="Cash" value={totalCash} />
          <SummaryCard c={c} label="QRIS" value={totalQris} />
          <SummaryCard c={c} label="TF" value={totalTf} />
          <SummaryCard
            c={c}
            label="Total Nominal"
            value={`Rp ${money(totalNominal)}`}
          />
        </section>
      </div>

      {showDataModal && (
        <Modal
          c={c}
          title={`Tambah Data - ${activeTable?.name || "Table"}`}
          onClose={() => setShowDataModal(false)}
        >
          <form onSubmit={handleAddData}>
            <DynamicForm
              c={c}
              fields={activeTemplate.fields}
              form={form}
              onChange={handleFormChange}
            />

            <ModalActions
              c={c}
              submitText="Simpan Data"
              onCancel={() => setShowDataModal(false)}
            />
          </form>
        </Modal>
      )}

      {showBranchModal && (
        <Modal
          c={c}
          title="Tambah Cabang"
          onClose={() => setShowBranchModal(false)}
        >
          <form onSubmit={handleAddBranch}>
            <div className="readylog-form-grid" style={formGrid}>
              <div>
                <label style={label(c)}>Nama Cabang</label>
                <input
                  value={branchForm.name}
                  onChange={(event) => {
                    const value = event.target.value;

                    setBranchForm({
                      name: value,
                      code: makeBranchCode(value),
                    });
                  }}
                  placeholder="Contoh: ReadyRoom Karejo"
                  style={neoInput(c)}
                />
              </div>

              <div>
                <label style={label(c)}>Kode Cabang</label>
                <input
                  value={branchForm.code}
                  onChange={(event) =>
                    setBranchForm((prev) => ({
                      ...prev,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Contoh: KAREJO"
                  style={neoInput(c)}
                />
              </div>
            </div>

            <ModalActions
              c={c}
              submitText="Simpan Cabang"
              onCancel={() => setShowBranchModal(false)}
            />
          </form>
        </Modal>
      )}

      {showTableModal && (
        <Modal c={c} title="Tambah Table" onClose={() => setShowTableModal(false)}>
          <form onSubmit={handleAddTable}>
            <div className="readylog-form-grid" style={formGrid}>
              <div>
                <label style={label(c)}>Template Table</label>
                <select
                  value={tableForm.templateKey}
                  onChange={(event) =>
                    setTableForm((prev) => ({
                      ...prev,
                      templateKey: event.target.value,
                    }))
                  }
                  style={neoInput(c)}
                >
                  {TABLE_TEMPLATES.map((template) => (
                    <option key={template.key} value={template.key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={label(c)}>Nama Table</label>
                <input
                  value={tableForm.name}
                  onChange={(event) =>
                    setTableForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Contoh: PLN Gancit Mei"
                  style={neoInput(c)}
                />
              </div>
            </div>

            <ModalActions
              c={c}
              submitText="Simpan Table"
              onCancel={() => setShowTableModal(false)}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

function EditableCell({ c, field, value, onChange, mobile = false }) {
  const responsiveInputStyle = mobile
    ? {
        width: "100%",
        minWidth: 0,
      }
    : {
        minWidth: `${getFieldWidth(field) - 24}px`,
      };

  if (field.type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        style={{
          ...cellInput(c),
          ...responsiveInputStyle,
        }}
      >
        {(field.options || []).map((option) => (
          <option key={option} value={option}>
            {String(option).toUpperCase()}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tulis keterangan..."
        rows={mobile ? 3 : 2}
        style={{
          ...cellInput(c),
          ...responsiveInputStyle,
          minHeight: mobile ? "76px" : "46px",
          resize: "vertical",
          whiteSpace: "normal",
          lineHeight: 1.35,
        }}
      />
    );
  }

  return (
    <input
      type={field.type === "date" || field.type === "time" ? field.type : "text"}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.type === "money" ? "0" : ""}
      style={{
        ...cellInput(c),
        ...responsiveInputStyle,
      }}
    />
  );
}

function DynamicForm({ c, fields, form, onChange }) {
  return (
    <div className="readylog-form-grid" style={formGrid}>
      {fields.map((field) => (
        <div key={field.key}>
          <label style={label(c)}>
            {field.label} {field.required ? "*" : ""}
          </label>

          {field.type === "select" ? (
            <select
              value={form[field.key] || ""}
              onChange={(event) => onChange(field.key, event.target.value)}
              style={neoInput(c)}
            >
              {(field.options || []).map((option) => (
                <option key={option} value={option}>
                  {String(option).toUpperCase()}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              value={form[field.key] || ""}
              onChange={(event) => onChange(field.key, event.target.value)}
              placeholder="Tulis keterangan..."
              rows={3}
              style={{
                ...neoInput(c),
                resize: "vertical",
                minHeight: "90px",
                lineHeight: 1.45,
              }}
            />
          ) : (
            <input
              type={
                field.type === "date" || field.type === "time"
                  ? field.type
                  : "text"
              }
              value={form[field.key] || ""}
              onChange={(event) => onChange(field.key, event.target.value)}
              placeholder={field.type === "money" ? "Contoh: 150000" : ""}
              style={neoInput(c)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Modal({ c, title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="readylog-modal-box"
        onClick={(event) => event.stopPropagation()}
        style={{
          ...neoPanel(c),
          background: c.panel,
          width: "100%",
          maxWidth: "920px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "18px",
        }}
      >
        <div style={topbar}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 950,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </div>

          <button type="button" onClick={onClose} style={neoButton(c, "#EF233C")}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: "18px" }}>{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ c, submitText, onCancel }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "18px",
        flexWrap: "wrap",
      }}
    >
      <button type="button" onClick={onCancel} style={neoButton(c, c.muted)}>
        Batal
      </button>

      <button type="submit" style={neoButton(c, "#06D6A0")}>
        {submitText}
      </button>
    </div>
  );
}

function SummaryCard({ c, label, value }) {
  return (
    <div
      style={{
        background: c.panel,
        border: `2px solid ${c.ink}`,
        borderRadius: "16px",
        padding: "14px",
        boxShadow: `5px 5px 0 ${c.ink}`,
      }}
    >
      <div style={{ fontSize: "12px", fontWeight: 950, color: c.sub }}>
        {label}
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "21px",
          fontWeight: 950,
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function getTheme(theme) {
  if (theme === "dark") {
    return {
      bg: "#111827",
      header: "#1F2937",
      panel: "#1F2937",
      panel2: "#253247",
      row: "#1F2937",
      rowAlt: "#253247",
      selected: "#3B4252",
      input: "#111827",
      text: "#F9FAFB",
      sub: "#CBD5E1",
      ink: "#020617",
      muted: "#94A3B8",
    };
  }

  return {
    bg: "#F7F3EA",
    header: "#FFFFFF",
    panel: "#FFFFFF",
    panel2: "#FFF4C2",
    row: "#FFFFFF",
    rowAlt: "#F8FAFC",
    selected: "#FEF3C7",
    input: "#FFFFFF",
    text: "#111827",
    sub: "#475569",
    ink: "#111827",
    muted: "#E5E7EB",
  };
}

const container = {
  width: "100%",
  maxWidth: "none",
  minHeight: "100vh",
  padding: "22px",
  boxSizing: "border-box",
};

const topbar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  flexWrap: "wrap",
};

const actionsWrap = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const title = {
  fontSize: "30px",
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.06em",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const sectionSub = {
  fontSize: "12px",
  opacity: 0.75,
  fontWeight: 800,
  marginTop: "4px",
  marginBottom: "14px",
};

const chipWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const filterGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(320px, 1fr) auto auto auto",
  gap: "10px",
  alignItems: "center",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginTop: "16px",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

function neoPanel(c) {
  return {
    background: c.panel,
    border: `2px solid ${c.ink}`,
    borderRadius: "18px",
    boxShadow: `7px 7px 0 ${c.ink}`,
  };
}

function logoBox(c) {
  return {
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    border: `2px solid ${c.ink}`,
    background: "#EF233C",
    color: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    fontSize: "18px",
    boxShadow: `5px 5px 0 ${c.ink}`,
  };
}

function neoButton(c, bg) {
  return {
    border: `2px solid ${c.ink}`,
    background: bg,
    color: bg === "#EF233C" || bg === "#111827" ? "#FFFFFF" : "#111827",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 950,
    boxShadow: `4px 4px 0 ${c.ink}`,
    whiteSpace: "nowrap",
  };
}

function neoInput(c) {
  return {
    width: "100%",
    background: c.input,
    color: c.text,
    border: `2px solid ${c.ink}`,
    borderRadius: "12px",
    padding: "11px 12px",
    outline: "none",
    fontSize: "14px",
    fontWeight: 800,
    boxSizing: "border-box",
  };
}

function branchChip(c, active, color) {
  return {
    border: `2px solid ${c.ink}`,
    background: active ? color : c.panel,
    color: active ? "#111827" : c.text,
    padding: "10px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 950,
    boxShadow: active ? `4px 4px 0 ${c.ink}` : "none",
  };
}

function tableChip(c, active, color) {
  return {
    border: `2px solid ${c.ink}`,
    background: active ? color : c.panel,
    color: active ? "#111827" : c.text,
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 950,
    boxShadow: active ? `4px 4px 0 ${c.ink}` : "none",
  };
}

function th(c) {
  return {
    background: "#DDE7F6",
    color: "#111827",
    padding: "13px 12px",
    textAlign: "left",
    borderRight: `2px solid ${c.ink}`,
    borderBottom: `2px solid ${c.ink}`,
    fontWeight: 950,
    fontSize: "13px",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 2,
  };
}

function td(c) {
  return {
    padding: "10px 12px",
    borderRight: `2px solid ${c.ink}`,
    borderBottom: `2px solid ${c.ink}`,
    fontSize: "13px",
    verticalAlign: "middle",
  };
}

function cellInput(c) {
  return {
    width: "100%",
    padding: "8px 10px",
    border: `2px solid ${c.ink}`,
    borderRadius: "10px",
    background: c.input,
    color: c.text,
    outline: "none",
    fontSize: "13px",
    fontWeight: 800,
    boxSizing: "border-box",
  };
}

function label(c) {
  return {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 950,
    color: c.text,
  };
}