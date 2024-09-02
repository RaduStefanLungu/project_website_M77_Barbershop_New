const appointments_collection_structure = [
    {
      "2024-10-24" : {
        locked : false,
        barbers : [
          {
            barber_id : 'PerrottaMirco',
            barber_locked : false,
            appointments : [
              {
                barber_id : "PerrottaMirco",
                appointment_id : "xyz",
                appointment_hour : "10:00",
                appointment_date : "2024-10-24",
                appointment_service : "modern haircut",
                appointment_user : {
                  email : "bob_gigi@test.com",
                  name : "Bob Gigi",
                  phone : "0123456789"
                },
                registered_time : "yyyy-mm-dd at hh:mm:ss"
              }
            ] 
          }
        ]
      }
    }
  ]

  const appointments_collection_structure_2 = [
    {
      "2024-10-24" : {
        locked : false,
        appointments : [
            {
                barber_id : "GigelFrone",
                appointment_id : "xyz",
                appointment_hour : "10:00",
                appointment_date : "2024-10-24",
                appointment_service : "modern haircut",
                appointment_user : {
                  email : "bob_gigi@test.com",
                  name : "Bob Gigi",
                  phone : "0123456789"
                },
                registered_time : "yyyy-mm-dd at hh:mm:ss"
              }
        ]
      }
    }
  ]

  const appointment_structure = {
    appointment : {
      barber_id : "GigelFrone",
      appointment_id : "xyz",
      appointment_hour : "10:00",
      appointment_date : "2024-10-24",
      appointment_service : "modern haircut",
      appointment_user : {
        email : "bob_gigi@test.com",
        name : "Bob Gigi",
        phone : "0123456789"
      },
      registered_time : "yyyy-mm-dd at hh:mm:ss"
    }
  }
  