// const express = require( 'express' );
// const mongoose = require( 'mongoose' );


// const Doctor = mongoose.model( 'doctor' );
// const Appointment = mongoose.model( 'appointment' )


// const bookAppointment = async ( req, res, next ) => {

//     let appointmentDetails = req.body;
//     let patientId = res.locals.claims.userId;
//     let doctorId = req.params.id;
//     let slotId = req.query.id

//     if( !appointmentDetails) {
//         const error = new Error( 'Appointment could not be made');
//         next( error );
//         return;
//     }
//     let newAppointment = {
//         startTime : appointmentDetails.startTime,
//         endTime : appointmentDetails.endTime,
//         date : appointmentDetails.date,
//         patient : patientId,
//         doctor : doctorId
//     }

//     await Appointment.create( newAppointment );
//         try {

//             let query = { _id : doctorId, 
//                         "slots._id" : slotId
//                     }
//             Doctor
//                 .findOneAndUpdate( query, { "slot.booked" : true })
//                 .then( updatedSlot => {
                    
//                     res.status( 201 ).send( 'Status updated of slot')
//                 })
//                 .catch( err => {
//                     return next( err );
//                 })
//         } catch (err) {
//             if( err.name === 'ValidationError' ) {
//                 err.status = 400;
//             } else {
//                 err.status = 500;
//             }

//             return next( err );
//         }
             
// }

// const cancelAppointment = async ( req, res, next ) => {

//     // cancelling an appointment means -> (i) delete the document from "appointment" collection becuase it is a kind of mapping of a doctor and a patient
//     // (ii) update the slot's 'booked' to false in doctors schema
//     let { startTime, endTime, date } = req.body;
//     let patientId = res.locals.claims.userId;
//     let doctorId = req.params.id;

//     let query = {
//         patientId : patientId,
//         doctorId : doctorId,
//         startTime : startTime,
//         endTime : endTime,
//         date : date
//     }

//     try {
//             await Appointment.findOneAndDelete( query ); // deleting from "appointment" schema

//             let query = { _id : doctorId, 
//                         "slots.startTime" : startTime,
//                         "slots.endTime" : endTime,
//                         "slots.date" : date
//                     }
//             // updating the "booked" of doctors slot
//             Doctor
//                 .findOneAndUpdate( query, { "slot.booked" : false }) 
//                 .then( updatedSlot => {
                    
//                     res.status( 201 ).send( 'Status updated of slot')
//                 })
//                 .catch( err => {
//                     return next( err );
//                 })
//         } catch (err) {
//             if( err.name === 'ValidationError' ) {
//                 err.status = 400;
//             } else {
//                 err.status = 500;
//             }

//             return next( err );
//         }
// }

// const getAllAppointments = async ( req, res, next ) => {
//     let patientId = res.locals.claims.userId;

//     let allAppointments = await Appointment.find( { patient : patientId } )

//     try {
//         res.status( 200 ).send( allAppointments)
//     } catch (error) {
//         res.send( 404 ).send( 'No appointments found')
//     }
                                            
// }


// module.exports = { bookAppointment, cancelAppointment, getAllAppointments }