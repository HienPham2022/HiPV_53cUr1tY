'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let data =[{"username":"Cathleen Poytheras","email":"cpoytheras0@sourceforge.net","urlweb":"http://comsenz.com","content":"Networked local internet solution","timeStemp":"01-03-2023"},
    {"username":"Lenka Gatchell","email":"lgatchell1@t.co","urlweb":"http://cnet.com","content":"Diverse value-added function","timeStemp":"02-04-2023"},
    {"username":"Shelley Hakonsson","email":"shakonsson2@cisco.com","urlweb":"https://statcounter.com","content":"Team-oriented empowering throughput","timeStemp":"2-06-2023"}];
    data.forEach(item =>{
      item.createdAt = Sequelize.literal('NOW()');
      item.updatedAt = Sequelize.literal('NOW()');  
    });
    await queryInterface.bulkInsert('Comments', data , {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Comments', null, {});
  }
};
