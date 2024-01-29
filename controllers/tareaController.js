import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js"

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body;
    try {
        const existeProyecto = await Proyecto.findById(proyecto);
        if(!existeProyecto) {
            const error = new Error("El Proyecto no existe");
            return res.status(404).json({ msg: error.message })
        }
        
        if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error("No tienes los permisos para añadir tareas");
            return res.status(403).json({ msg: error.message });
        }
        try {
            const tareaAlmacenada = await Tarea.create(req.body);
            res.json(tareaAlmacenada)
            // Almacenar el ID en el proyecto
            existeProyecto.tareas.push(tareaAlmacenada._id);
            await existeProyecto.save();
        } catch (error) {
            console.error(error)
        }
    } catch (e) {
        const error = new Error("El Proyecto no existe");
        return res.status(404).json({ msg: error.message });
    }
    
    
};

const obtenerTarea = async (req, res) => {
    const { id } = req.params;
    try {
        const tarea = await Tarea.findById(id).populate("proyecto");

        if(!tarea) {
            const error = new Error("Tarea no Encontrada");
            return res.status(404).json({ msg: error.message })
        }

        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error("Acción no válida");
            return res.status(403).json({ msg: error.message });
        }

        return res.json(tarea);
    } catch (e) {
        const error = new Error("Tarea no Encontrada");
        return res.status(404).json({ msg: error.message })
    }
};

const actualizarTarea = async (req, res) => {
    const { id } = req.params;
    try {
        const tarea = await Tarea.findById(id).populate("proyecto");

        if(!tarea) {
            const error = new Error("Tarea no Encontrada");
            return res.status(404).json({ msg: error.message })
        }

        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error("Acción no válida");
            return res.status(403).json({ msg: error.message });
        }

        tarea.nombre = req.body.nombre || tarea.nombre;
        tarea.descripcion = req.body.descripcion || tarea.descripcion;
        tarea.prioridad = req.body.prioridad || tarea.prioridad;
        tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

        try {
            const tareaAlmacenada = await tarea.save();

            return res.json(tareaAlmacenada);
        } catch (error) {
            console.error(error)
        }

    } catch (e) {
        const error = new Error("Tarea no Encontrada");
        return res.status(404).json({ msg: error.message })
    }
};

const eliminarTarea = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findOne({_id: id}).populate("proyecto");
    if(!tarea) {
        const error = new Error("Tarea no Encontrada");
        return res.status(404).json({ msg: error.message });
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Válida");
        return res.status(403).json({ msg: error.message });
    }

    try {
        const proyecto = await Proyecto.findOne({_id: tarea.proyecto});
        proyecto.tareas.pull(tarea._id);

        await Promise.allSettled( [ await proyecto.save(), await Tarea.deleteOne() ] );

        return res.json({ msg: "La Tarea se Eliminó Correctamente"})
    } catch (error) {
        console.error(error); 
    }

};

const cambiarEstado = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findOne({_id: id}).populate("proyecto");

    
    if(!tarea) {
        const error = new Error("Tarea no Encontrada");
        return res.status(404).json({ msg: error.message });
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("Acción no Válida");
        return res.status(403).json({ msg: error.message });
    } 
    
    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save();

    const tareaAlmacenada = await Tarea.findOne({_id: id}).populate("proyecto").populate("completado");

    res.json(tareaAlmacenada)
};  

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
}
