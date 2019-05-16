module.exports = {
  hrPool: {
    user: process.env.HR_USER || "hr",
    password: process.env.HR_PASSWORD || "Welcome1",
    connectString: process.env.HR_CONNECTIONSTRING  || "172.27.0.2/PDB1",
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0
  }
};
