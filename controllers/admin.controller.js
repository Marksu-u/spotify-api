import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import bcrypt from 'bcryptjs';

export const loginAdmin = async (req, res) => {
  try {
    const {username, password} = req.body;
    const admin = await Admin.findOne({
      $or: [{username: username}, {email: username}],
    });

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res
        .status(401)
        .json({message: 'Invalid username/email or password'});
    }

    const token = jwt.sign({id: admin._id}, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    res.json({token});
  } catch (error) {
    res.status(500).json({message: 'Internal server error'});
  }
};

export const getAdmins = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 16;

  try {
    const admin = await Admin.find()
      .sort({_id: 1})
      .limit(limit)
      .skip((page - 1) * limit);
    res.json(admin);
  } catch (error) {
    res.status(500).json({message: 'Error retrieving admins'});
  }
};

export const getLastAdmin = async (req, res) => {
  try {
    const lastAdmin = await Admin.findOne().sort({_id: -1});
    res.json(lastAdmin);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const getSingleAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({message: 'Admin not found'});
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({message: 'Error retrieving admin'});
  }
};

export const addAdmin = async (req, res) => {
  try {
    const {username, email, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newAdmin = new Admin({username, email, password: hashedPassword});

    await newAdmin.save();
    res.status(201).json({message: 'New Admin created successfully'});
  } catch (error) {
    res.status(500).json({message: 'Error creating new admin'});
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (updates.password) {
      updates.password = bcrypt.hashSync(updates.password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedAdmin) {
      return res.status(404).json({message: 'Admin not found'});
    }

    res.json({message: 'Admin updated successfully', updatedAdmin});
  } catch (error) {
    res.status(500).json({message: 'Error updating admin'});
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const {id} = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({message: 'Admin not found'});
    }

    res.json({message: 'Admin deleted successfully'});
  } catch (error) {
    res.status(500).json({message: 'Error deleting admin'});
  }
};
