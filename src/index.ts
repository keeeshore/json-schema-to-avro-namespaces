const jsonSchemaAvro = require('jsonschema-avro');
const fs = require('fs');

const namespace = 'com.au.commbank';
const jsonSchema = {
    "$id": "/com/au/commbank/main",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Complex Object",
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "age": {
            "type": "integer",
            "minimum": 0
        },
        "address1": {
            "id": "/sample/address1",
            "type": "object",
            "properties": {
                "street1": {
                    "type": "string"
                },
                "street2": {
                    "type": "object",
                    "properties": {
                        "street2": {
                            "type": "string"
                        },
                        "address3": {
                            "type": "object",
                            "properties": {
                                "street3": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "required": ["code"]
                }
            },
            "required": ["street", "city", "state", "postalCode"]
        },
        "hobbies": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["name", "age"]
};

const avro = jsonSchemaAvro.convert(jsonSchema);

fs.writeFileSync('avro.avsc', JSON.stringify(avro, null, 2));
console.log('Avro schema has been written to avro.avsc');

// Recursive function to process the Avro object
function processAvroObject(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => processAvroObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        const maxDepth = 1;
        for (const [key, value] of Object.entries(obj)) {
            if (key === 'name' && typeof value === 'string' && (value.match(/_/g) || []).length > maxDepth) {
                const valueArr = value.split('_');
                newObj[key] = valueArr.slice(maxDepth + 1).join('_');
                newObj["namespace"] = `${namespace}.${valueArr.slice(0, maxDepth + 1).join('.')}`;
            } else {
                newObj[key] = processAvroObject(value);
            }
        }
        return newObj;
    }
    
    return obj;
}

// Process the Avro schema
const processedAvro = processAvroObject(avro);

// Write the processed Avro schema to a file
fs.writeFileSync('processedAvro.avsc', JSON.stringify(processedAvro, null, 2));
console.log('Processed Avro schema has been written to avro.avsc');
