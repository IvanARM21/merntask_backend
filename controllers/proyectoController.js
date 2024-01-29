import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js";


const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
      '$or' : [
        {'colaboradores' : { $in: req.usuario}},
        {'creador' : { $in: req.usuario}},
      ]
    })
      .select('-tareas');

    res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.error(error)
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params;

    const proyecto = await Proyecto.findOne({_id: id}).populate({path: 'tareas', populate: { path: 'completado', select: "nombre"}}).populate('colaboradores', "nombre email");
   
    if(!proyecto) {
      const error = new Error('Proyecto no Encontrado');
      return res.status(404).json({ msg: error.message }); 
    };
  
    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString() )){
      const error = new Error('Acción no Válida');
      return res.status(401).json({ msg: error.message });
    };

    return res.json(
      proyecto,
    );

  } 

const editarProyecto = async (req, res) => {
    const { id } = req.params;
   
    try {
      const proyecto = await Proyecto.findById(id);
      if(!proyecto) {
        const error = new Error('Proyecto no Encontrado');
        return res.status(404).json({ msg: error.message }); 
      };
   
      if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción no Válida');
        return res.status(401).json({ msg: error.message });
      };

      proyecto.nombre = req.body.nombre || proyecto.nombre;
      proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
      proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
      proyecto.cliente = req.body.cliente || proyecto.cliente;

      try {
        const proyectoAlmacenado = await proyecto.save();
        return res.json(proyectoAlmacenado)
      } catch (error) {
        console.error(error)
      }

    } catch (e) {
        const error = new Error('Proyecto no Encontrado');
        return res.status(401).json({ msg: error.message });
    };
}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;
   
    try {
      const proyecto = await Proyecto.findById(id);
      if(!proyecto) {
        const error = new Error('Proyecto no Encontrado');
        return res.status(404).json({ msg: error.message }); 
      };
   
      if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción no Válida');
        return res.status(401).json({ msg: error.message });
      };
      try {
        await proyecto.deleteOne();
        return res.json({ msg: "Proyecto Eliminado" })
      } catch (error) {
        console.log(error)
      }
    } catch (e) {
        const error = new Error('Proyecto no Encontrado');
        return res.status(401).json({ msg: error.message });
    };
}

const buscarColaborar = async (req, res) => {
    const { email } = req.body;

    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');

    if(!usuario) {
      const error = new Error('Usuario no Encontrado');
      return res.status(404).json({ msg: error.message });
    }

    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
  
    const proyecto = await Proyecto.findOne({_id: req.params.id});

    if(!proyecto) {
      const error = new Error('Proyecto No Encontrado');
      return res.status(404).json({ msg: error.message });
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error('Acción no válida');
      return res.status(404).json({ msg: error.message })
    }

    const { email } = req.body;

    const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v');

    if(!usuario) {
      const error = new Error('Usuario no Encontrado');
      return res.status(404).json({ msg: error.message });
    }
    // El Colaborador no es el Admin del Proyecto
    if(proyecto.creador.toString() === usuario._id.toString()) {
      const error = new Error('El Creador del Proyecto no puede ser Colaborador');
      return res.status(401).json({ msg: error.message });
    }
    // Revistar que no este ya agregado al Proyecto
    if(proyecto.colaboradores.includes(usuario._id)) {
      const error = new Error('El Usuario ya pertenece al Proyecto');
      return res.status(401).json({ msg: error.message });
    }

    // Parece estar todo bien, agregemoslo
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({msg: 'Colaborador Agregado Correctamente'})
    
}

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findOne({_id: req.params.id});

  if(!proyecto) {
    const error = new Error('Proyecto No Encontrado');
    return res.status(404).json({ msg: error.message });
  }
  if(proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Acción no válida');
    return res.status(404).json({ msg: error.message })
  }

  const { email } = req.body;

  // Parece estar bien, eliminando... 
  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({msg: 'Colaborador Eliminado Correctamente'})
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborar,
    agregarColaborador,
    eliminarColaborador,
}