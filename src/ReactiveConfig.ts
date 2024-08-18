import { FSWatcher, watch } from "chokidar";
import { EventEmitter } from "events";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";

export interface ReactiveConfigOptions {
    lazySaveDelay: number;
    autoInit: boolean;
}

export const defaultReactiveConfigOptions = {
    lazySaveDelay: 1000,
    autoInit: true,
};

export interface ConfigParser {
    parse: (content: string) => any;
    stringify: (value: any) => string;
}

export class ReactiveConfig<T extends {}> {
    public static configParser = new Map<string, ConfigParser>([
        ['json', JSON],
    ]);

    public _value?: T;
    public _default: T;

    private options: ReactiveConfigOptions;
    private parser: ConfigParser;

    private _loaded: boolean = false;

    private _loadFilter?: (value: any) => T | Promise<T>;
    private _saveFilter?: (value: T) => any | Promise<any>;

    private saving: boolean = false;

    private fileName: string;
    private eventEmitter: EventEmitter;
    private fileWatcher?: FSWatcher;

    private lazySaveTimer?: NodeJS.Timeout;

    public static addParser(ext: string | string[], parser: ConfigParser) {
        if (Array.isArray(ext)) {
            for (let item of ext) {
                ReactiveConfig.configParser.set(item, parser);
            }
        } else {
            ReactiveConfig.configParser.set(ext, parser);
        }
    }

    constructor(fileName: string, defaultVal: T, options: Partial<ReactiveConfigOptions> = {}) {
        this._default = defaultVal;
        this.fileName = fileName;
        this.eventEmitter = new EventEmitter();

        this.options = { ...defaultReactiveConfigOptions, ...options };

        let parser: ConfigParser | undefined;
        for (let [ext, parserItem] of ReactiveConfig.configParser) {
            if (fileName.endsWith(`.${ext}`)) {
                parser = parserItem;
                break;
            }
        }

        if (!parser) {
            throw new Error('No parser found for the file extension of the config file');
        }

        this.parser = parser;

        if (this.options.autoInit) {
            this.initialize().catch((err: any) => {
                this.eventEmitter.emit('error', err, 'initialize');
            });
        }
    }

    public get value(): T {
        return this._value ?? this._default;
    }

    public set value(newVal: T | undefined) {
        this._value = newVal;
    }

    public get loaded() {
        return this._loaded;
    }

    public on(eventName: 'load', listener: () => void): void
    public on(eventName: 'change', listener: (newValue: T, oldValue: T) => void): void
    public on(eventName: 'data', listener: (value: T) => void): void
    public on(eventName: 'saved', listener: (value: T) => void): void
    public on(eventName: 'error', listener: (error: Error, from: string) => void): void
    public on(eventName: string, listener: (...args: any[]) => void) {
        this.eventEmitter.on(eventName, listener);
    }

    public setLoadFilter(filter: (value: any) => T) {
        this._loadFilter = filter;
    }

    public setSaveFilter(filter: (value: T) => any) {
        this._saveFilter = filter;
    }

    /**
     * Initialize the config instance
     * @param autoCreate 
     */
    public async initialize(autoCreate: boolean = true) {
        let isSuccess = await this.load();
        if (!isSuccess && autoCreate) {
            this._value = this._default;
            await this.save();
        }
        this._loaded = true;
    }

    /**
     * Destroy the config instance
     */
    public async destroy() {
        this.fileWatcher?.close();
        this.eventEmitter.removeAllListeners();
    }

    public initWatcher() {
        this.fileWatcher = watch(this.fileName, {
            ignoreInitial: true,
            ignorePermissionErrors: true,
            persistent: true,
        });

        this.fileWatcher.on('change', () => {
            if (!this.saving) {
                this.load();
            } else {
                this.saving = false;
            }
        });
    }

    /**
     * Load the config file
     * @returns 
     */
    public async load() {
        if (!this.fileWatcher) {
            this.initWatcher();
        }

        try {
            let oldValue = this.value;
            if (existsSync(this.fileName)) {
                let content = await readFile(this.fileName, { encoding: 'utf-8' });
                let value: any;
                
                value = this.parser.parse(content);

                if (this._loadFilter) {
                    value = await this._loadFilter(value);
                }

                this._value = value;

                if (oldValue) {
                    this.eventEmitter.emit('change', this._value, oldValue);
                } else {
                    this.eventEmitter.emit('load');
                }
                this.eventEmitter.emit('data', this._value);
                this._loaded = true;
                return true;
            } else {
                return false;
            }
        } catch (e: any) {
            this.eventEmitter.emit('error', e, 'load');
            return false;
        }
    }

    /**
     * Save the config file immediately
     * @returns
     */
    public async save() {
        try {
            if (this._value) {
                this.saving = true;

                let value = this._value;

                if (this._saveFilter) {
                    value = await this._saveFilter(this._value);
                }

                let content: string;
                
                content = this.parser.stringify(value);

                await writeFile(this.fileName, content);
                this.eventEmitter.emit('saved', this._value);
                return true;
            }
            return false;
        } catch (e: any) {
            this.eventEmitter.emit('error', e, 'save');
            return false;
        }
    }

    /**
     * Save the config file after 1 second
     */
    public lazySave() {
        if (this._value) {
            if (!this.lazySaveTimer) {
                this.lazySaveTimer = setTimeout(() => {
                    this.save();
                    this.lazySaveTimer = undefined;
                }, this.options.lazySaveDelay);
            }
        }
    }
}