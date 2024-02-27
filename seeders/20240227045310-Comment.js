'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let data = [{
      content: "Excepturi perferendis adipisci exercitationem ullam laborum, quam dignissimos quo, delectus ducimus incidunt tenetur voluptatibus accusantium eius maiores quisquam molestias doloremque! Amet, tenetur.",
      vote: 3,
      time: Sequelize.literal('NOW()'),
      userID: 1,
    },
    {
      content: "Tenetur sint repellat inventore maiores eveniet at est aperiam porro cum non pariatur accusantium veritatis molestias necessitatibus cupiditate odio, quo magni veniam?",
      vote: 2,
      time: Sequelize.literal('NOW()'),
      userID: 2,
    },
    {
      content: "Odio labore nulla sunt numquam. Unde, repellendus. Ratione consequuntur magni repellendus natus quas, nam rerum reprehenderit eos, impedit, nihil officia perspiciatis incidunt?",
      vote: 2,
      time: Sequelize.literal('NOW()'),
      userID: 3,
    },
    ];
    data.forEach(item => {
      item.createdAt = Sequelize.literal('NOW()');
      item.updatedAt = Sequelize.literal('NOW()');

    });
    await queryInterface.bulkInsert('Comments', data, {});

  },


  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Comments', null, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
