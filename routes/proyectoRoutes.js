import express from 'express'

import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborar,
    agregarColaborador,
    eliminarColaborador,
} from '../controllers/proyectoController.js'

import checkAuth from '../middleware/checkAuth.js'

const router = express.Router();

router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto);
router.route('/:id').get(checkAuth, obtenerProyecto).put(checkAuth, editarProyecto).delete(checkAuth, eliminarProyecto)

router.post('/colaboradores', checkAuth, buscarColaborar);
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);



export default router;


