const eduModel = sequelize.define("eduinfo", {
    edu_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  
    // ta'lim muassasasi
    edu_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  
    // talim davri
    study_year: {
      type: DataTypes.STRING,
    },
  
    // malumoti
    degree: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // mutahasisligi
    specialty: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',  // users modeliga bog'lanadi
          key: 'user_id',  // users jadvalidagi user_id ga
        },
        onDelete: 'CASCADE',  // Foydalanuvchi o'chirilsa, unga bog'langan ta'lim ma'lumotlari ham o'chiriladi
      }
  }, {
    timestamps: true // Enable timestamps
  }
);
  
  export default eduModel;