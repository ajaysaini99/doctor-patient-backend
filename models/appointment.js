const mongoose = require( 'mongoose' );

const timeSchema =  {
    hours : {
        type : Number,
        required : true,
        min : 0,
        max : 24
    },
    minutes : {
        type : Number,
        required : true,
        min : 0,
        max : 59
    }
}

const appointmentSchema = new mongoose.Schema( { 
    
    startTime : {
        type : timeSchema,
        required : true
    },
    endTime : {
        type : timeSchema,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    slotId : {
        type : mongoose.Schema.Types.ObjectId,
    },
    doctorId : {
        type : mongoose.Schema.Types.ObjectId
        
    },
    patientId : {
        type : mongoose.Schema.Types.ObjectId
    },
    doctorInfo : {
        name : String,
        speciality : String,
        clinicAddress : String
    },
    patientInfo : {
        name : String,
    }
} )

module.exports = mongoose.model( 'appointment', appointmentSchema );