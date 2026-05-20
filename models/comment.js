'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        static associate(models) {}
    }

    Comment.init({
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: { isEmail: true, allowNull: true }
        },
        urlweb: {
            type: DataTypes.STRING,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: { notEmpty: true }
        },
        timeStemp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Comment'
    });

    return Comment;
};
