const DEPT_CODE = {
  103: "CIVIL",
  104: "CSE",
  105: "EEE",
  106: "ECE",
  114: "MECH",
};

const splitRegNumber = (regNumber, type) => {
  if (!regNumber || regNumber.length < 12) return "";
  const year = Number(regNumber.slice(4, 6));
  const code = regNumber.slice(6, 9);
  switch (type) {
    case "batch":
      return `20${year} - 20${year + 4}`;
    case "dept":
      return DEPT_CODE[code] || "Unknown";
    default:
      return "";
  }
};

module.exports = { DEPT_CODE, splitRegNumber };
