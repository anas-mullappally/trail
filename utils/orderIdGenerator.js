const generateOrderId = () => {
  const prefix = "OD"; // Order ID prefix
  const uniqueIdentifier = Date.now(); // Unique identifier (timestamp)
  return `${prefix}-${uniqueIdentifier}`;
};

module.exports = { generateOrderId };
