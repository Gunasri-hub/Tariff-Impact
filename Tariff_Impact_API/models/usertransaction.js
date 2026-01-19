'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserTransaction.init({
    transactionCode: DataTypes.STRING,
    transactionType: DataTypes.STRING,
    transactionDate: DataTypes.STRING,
    status: DataTypes.STRING,
    buyerId: DataTypes.STRING,
    buyerName: DataTypes.STRING,
    buyerType: DataTypes.STRING,
    buyerPhone: DataTypes.STRING,
    buyerEmail: DataTypes.STRING,
    buyerAddress: DataTypes.TEXT,
    sellerId: DataTypes.STRING,
    sellerName: DataTypes.STRING,
    sellerType: DataTypes.STRING,
    sellerPhone: DataTypes.STRING,
    sellerEmail: DataTypes.STRING,
    sellerAddress: DataTypes.TEXT,
    originCountry: DataTypes.STRING,
    originCurrency: DataTypes.STRING,
    destinationCountry: DataTypes.STRING,
    destinationCurrency: DataTypes.STRING,
    modeOfTransport: DataTypes.STRING,
    mainCategory: DataTypes.STRING,
    subCategory: DataTypes.STRING,
    htsCode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserTransaction',
  });
  return UserTransaction;
};