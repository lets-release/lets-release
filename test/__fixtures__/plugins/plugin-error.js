export default {
  verifyConditions: () => {
    const error = new Error("a");
    error.errorProperty = "errorProperty";
    throw error;
  },
};
