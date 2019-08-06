import initForm from './initForm.js';
import sendTask from './sendTask.js';
import createCfgxFile from './createCfgxFile.js';
import fixFilename from './fixFilename.js';


//const API_ROUTE = 'http://urad.ite.tul.cz:6670/api';
//const API_ROUTE = 'http://localhost:5000/api';
//const API_ROUTE = `http://urad.ite.tul.cz:6660/ws/api`; // 
const API_ROUTE = 'api';


window.createCfgxFile = createCfgxFile

function main() {
    
    const form = initForm()

    form.onSubmit = (data) => {
        let isCustomDataset = Array.isArray(data.wavFiles);
        data.configFile = createCfgxFile(data.phonemeType, data.language, isCustomDataset, data.advanced);
        window.data = data
        console.log(data);

        if (isCustomDataset) {
            data.wavFiles.forEach(file => file.name = fixFilename(file.name));
        }
        
        sendTask(API_ROUTE, data)
            .then(() => {
                alert('Úspěšně odesláno');
            })
            .catch((err) => {
                alert(`Odeslání se nepodařilo`);
                console.error(err.message)
            });
    }
}

main();