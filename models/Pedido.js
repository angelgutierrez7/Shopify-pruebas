import { DataTypes } from "sequelize";
import sequelize from "./database.js";

const Pedido = sequelize.define("Pedido", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  order_id: { type: DataTypes.BIGINT, allowNull: false },
  email: { type: DataTypes.STRING },
  total_price: { type: DataTypes.DECIMAL(10, 2) },
  currency: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
  data: { type: DataTypes.JSON },
});


export default Pedido;
