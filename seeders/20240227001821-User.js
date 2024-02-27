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
    let data =[{
      firstName: "Hien",
      lastName: "Pham",
      role: "Associate",
      password: "12345",
      email: "hienhien@gmail.com",
      isAdmin: "1",
    },
    {
      firstName: "Loc",
      lastName: "Phan",
      role: "Senior",
      password: "12345",
      email: "LocLoc@gmail.com",
      isAdmin: "0",
    },
    {
      firstName: "Bang",
      lastName: "Nguyen",
      role: "Director",
      password: "12345",
      email: "bangbang@gmail.com",
      isAdmin: "0",
    }
  ];
  data.forEach(item =>{
    item.createdAt = Sequelize.literal('NOW()');
    item.updatedAt = Sequelize.literal('NOW()');

  });
  await queryInterface.bulkInsert('Users', data , {});

  },


  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
