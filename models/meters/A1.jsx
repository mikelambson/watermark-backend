config = {
  name: "A1",
  source: {
    type: "file",
    location: "path/to/A1-data.csv",
    ignoreLines: 1,
    commentChar: "#",
  },
  fields: {
    DateTime: {
      type: Sequelize.DATE,
      primaryKey: true,
      sourceField: "DateTime",
    },
    StationName: {
      type: Sequelize.STRING,
      primaryKey: true,
      sourceField: "StationName",
    },
    Stage: {
      type: Sequelize.FLOAT,
      sourceField: "HG",
    },
    FlowRate: {
      type: Sequelize.FLOAT,
      sourceField: "HGQ",
    },
    BatteryVoltage: {
      type: Sequelize.FLOAT,
      sourceField: "VB",
    },
  },
};
