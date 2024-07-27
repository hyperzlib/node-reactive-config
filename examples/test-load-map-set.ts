import { ReactiveConfig } from "../src";
import { TestSetMapConfig } from "./type-def";

async function main() {
    const config = new ReactiveConfig<Partial<TestSetMapConfig>>(__dirname + '/config/test-config.json', {});

    config.setLoadFilter((data) => {
        if (data.list) {
            data.list = new Set(data.list);
        }

        if (data.str_list) {
            data.str_list = new Set(data.str_list);
        }

        if (data.map) {
            data.map = new Map(Object.entries(data.map));
        }

        return data;
    });

    config.setSaveFilter((data) => {
        let newData: any = { ...data };

        if (data.list) {
            newData.list = Array.from(data.list);
        }

        if (data.str_list) {
            newData.str_list = Array.from(data.str_list);
        }

        if (data.map) {
            newData.map = Object.fromEntries(data.map);
        }

        return newData;
    });

    config.on('data', (value) => {
        console.log(value);
    });
}

main().catch(console.error);