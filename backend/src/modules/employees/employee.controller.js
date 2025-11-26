/**
 * Employee Controller
 * Handles HTTP requests for employee endpoints
 */
const employeeService = require('./employee.service');

/**
 * Validation patterns
 */
const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

/**
 * GET /api/employees
 * Get all employees for tenant
 */
const getEmployees = async (req, res, next) => {
  try {
    const { status, employeeType, limit, offset } = req.query;
    
    const result = await employeeService.getEmployees(req.tenantId, {
      status,
      employeeType,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employees/:id
 * Get employee by ID
 */
const getEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id, req.tenantId);

    res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/employees
 * Create a new employee
 */
const createEmployee = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, employeeType, hireDate, schedule, serviceIds } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, and email are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate email format
    if (!VALIDATION.EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    }

    const employee = await employeeService.createEmployee({
      firstName,
      lastName,
      email,
      phone,
      employeeType,
      hireDate,
      schedule,
      serviceIds,
    }, req.tenantId);

    res.status(201).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/employees/:id
 * Update employee
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, employeeType, status, hireDate, serviceIds, metadata } = req.body;

    // Validate email format if provided
    if (email && !VALIDATION.EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    }

    const employee = await employeeService.updateEmployee(req.params.id, req.tenantId, {
      firstName,
      lastName,
      email,
      phone,
      employeeType,
      status,
      hireDate,
      serviceIds,
      metadata,
    });

    res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/employees/:id
 * Delete employee
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const result = await employeeService.deleteEmployee(req.params.id, req.tenantId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employees/:id/schedule
 * Get employee schedule
 */
const getEmployeeSchedule = async (req, res, next) => {
  try {
    const schedule = await employeeService.getEmployeeSchedule(req.params.id, req.tenantId);

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/employees/:id/schedule
 * Update employee schedule
 */
const updateEmployeeSchedule = async (req, res, next) => {
  try {
    const { schedule } = req.body;

    if (!schedule) {
      return res.status(400).json({
        success: false,
        error: 'Schedule object is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await employeeService.updateEmployeeSchedule(req.params.id, req.tenantId, schedule);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeSchedule,
  updateEmployeeSchedule,
};
