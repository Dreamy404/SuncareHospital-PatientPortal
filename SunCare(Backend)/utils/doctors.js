const { getConnection } = require('../middleware/database');


//@desc Given An Array of doctor object(only id is necessary it returns all other info of the doctors in a new array)

exports.doctorDetails = async (doctors) => {
    try {
        const connection = await getConnection();

        const enrichedDoctors = await Promise.all(doctors.map(async (doc) => {
            const [degrees] = await connection.execute('CALL DOCTOR_DEGREES(?)', [doc.id]);
            const [practicedays] = await connection.execute('CALL DOCTOR_WEEK_DAYS(?)', [doc.id]);

            return {
                ...doc,
                degrees: degrees[0],
                practicedays: practicedays[0]
            }
        }));

        return enrichedDoctors;
    } catch (error) {
        throw error;
    }
}

//@desc given the params it does the preprocessing to perform query using temporary table and returns the query result(doc id,name,image)
exports.multiParamDoctorSearch = async (name, degrees, subjects, desigs,offset,limit) => {
    try {
        const connection = await getConnection();

        // Normalize input parameters
        function normalizeToIntArray(value) {
            if (Array.isArray(value)) return value.map((id) => parseInt(id, 10));
            return value ? [parseInt(value, 10)] : null;
        }

        degrees = normalizeToIntArray(degrees);
        subjects = normalizeToIntArray(subjects);
        desigs = normalizeToIntArray(desigs);

        const degree_cnt = degrees ? degrees.length : 0;
        const subject_cnt = subjects ? subjects.length : 0;
        const desig_cnt = desigs ? desigs.length : 0;

        // Create temporary tables
        await connection.execute('CREATE TEMPORARY TABLE SELECTED_DEGREE(ID INTEGER NOT NULL)');
        await connection.execute('CREATE TEMPORARY TABLE SELECTED_SUBJECT(ID INTEGER NOT NULL)');
        await connection.execute('CREATE TEMPORARY TABLE SELECTED_DESIGNATION(ID INTEGER NOT NULL)');

        // Insert values into temporary tables
        if (degree_cnt > 0) {
            await Promise.all(degrees.map( async (id) =>await connection.execute('INSERT INTO SELECTED_DEGREE (ID) VALUES(?)', [id])));
        }

        if (subject_cnt > 0) {
            await Promise.all(subjects.map(async (id) =>await connection.execute('INSERT INTO SELECTED_SUBJECT (ID) VALUES(?)', [id])));
        }

        if (desig_cnt > 0) {
            await Promise.all(desigs.map(async (id) =>await connection.execute('INSERT INTO SELECTED_DESIGNATION (ID) VALUES(?)', [id])));
        }

        // Execute stored procedure
        const [rows] = await connection.execute('CALL ADVANCED_SEARCH_DOCTORS(?,?,?,?,?,?)', [name, degree_cnt, subject_cnt, desig_cnt,offset,limit]);


        await connection.execute('DROP TEMPORARY TABLE IF EXISTS SELECTED_DEGREE');
        await connection.execute('DROP TEMPORARY TABLE IF EXISTS SELECTED_SUBJECT');
        await connection.execute('DROP TEMPORARY TABLE IF EXISTS SELECTED_DESIGNATION');

        return rows;
    } catch (error) {
        throw error;
    }
};

//@desc given the params(one of every type) it returns the results (id,name,image-link) 

exports.singleParamDoctorSearch=async (name,degrees,subjects,desigs,offset,limit)=>{
    try {
        const connection=await getConnection();
        
        degrees=degrees?parseInt(degrees,10):null;
        subjects=subjects?parseInt(subjects,10):null;
        desigs=desigs?parseInt(desigs,10):null;

        const [rows]=await connection.execute('CALL ONE_PARAM_ADVANCED_SEARCH(?,?,?,?,?,?)',[name,degrees,desigs,subjects,offset,limit]);

        return rows;
    } catch (error) {
        throw error;
    }
}


//@desc given the params(one of every type) it returns the results count 

exports.singleParamDoctorSearchCnt=async (name,degrees,subjects,desigs,offset,limit)=>{
    try {
        const connection=await getConnection();
        
        degrees=degrees?parseInt(degrees,10):null;
        subjects=subjects?parseInt(subjects,10):null;
        desigs=desigs?parseInt(desigs,10):null;

        const [rows]=await connection.execute('CALL ONE_PARAM_ADVANCED_SEARCH_CNT(?,?,?,?,?,?)',[name,degrees,desigs,subjects,offset,limit]);

        return rows;
    } catch (error) {
        throw error;
    }
}