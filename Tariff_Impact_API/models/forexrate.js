'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ForexRate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ForexRate.init({
    date: DataTypes.DATEONLY,
    base: DataTypes.STRING,
    target: DataTypes.STRING,
    rate: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'ForexRate',
  });
  return ForexRate;
};