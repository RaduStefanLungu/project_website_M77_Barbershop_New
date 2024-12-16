

Project : Appointment System


TODO : Work on the appointment system
    -> update profile creatinon to add field : locked_days = []             DONE
    -> work on addAppointment2                                              DONE (it works)
    -> AppointmentForm : show available hours for chosen day                DONE
    -> test addAppointment2 DONE (it works)                                 DONE

Planning : 
    Users : 
        - Users can chose a barber, a date & hour and a service. 
            TODO : 
                - list available hours /barber/date                         DONE
                - list available services                                   DONE
        - They'll receive a confirmation email if the appointment has been successully saved.
            TODO : 
                - send confirmation email                                   TODO     

    - Barbers can do:  
        - connect with own account, choose the day (>= today) and list their appointments.
        - check/uncheck appointment (if user not present)
        - totally remove appointment from list
        - send recall email for user(s)

    - Admin(owner) can do : 
        - create/delete new accounts for each employee -> creating/deleting profiles as well
            TODO : 
                - create actual account in firebase.auth                    DONE
        - list all appointments by barber
            TODO : this
        - remove any appointment from each list
            TODO : this
        - check a daily report of # of appointments/barber + amount($)/barber
            TODO : this




Project : Inventory System
    
    - Add & save new product to inventory
    - Modify # of products (selled/used/bought)
    - Remove products from inventory
    - Upload photo of product ? ()