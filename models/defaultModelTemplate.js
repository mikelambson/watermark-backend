import Sequelize from "sequelize";

// Define a function to create a model with the provided schema
const createModel = (sequelize, schema) => {
  const modelAttributes = {};

  // Define data types and attributes based on the schema
  schema.forEach((column) => {
    const { columnName, dataType, ...attributes } = column;
    modelAttributes[columnName] = {
      type: Sequelize[dataType],
      ...attributes,
    };
  });

  // Create the model
  const Model = sequelize.define("ModelName", modelAttributes);

  // Define associations, if needed
  // Example: Model.associate = (models) => {
  //   Model.hasMany(models.OtherModel);
  // };

  return Model;
};

export default createModel;
