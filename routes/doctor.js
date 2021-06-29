const express = require( 'express' );

const { register, login } = require( '../controllers/authDoctor' )
const { getPatients, makeSlots, getSlots, cancelAppointment } = require( '../controllers/doctor' );
const { authenticate } = require( '../middleware/auth' )


const router = express.Router();

router.post( '/register', register )
router.post( '/login', login )

router.get( '/appointments', authenticate, getPatients )
router.patch( '/:id', authenticate, cancelAppointment );
router.post( '/make-slots', authenticate, makeSlots );
router.get( '/slots', authenticate, getSlots );


module.exports = router;