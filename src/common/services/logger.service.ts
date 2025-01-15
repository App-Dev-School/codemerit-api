import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logFilePath: string;

  constructor() {
    // Define the log file path
    this.logFilePath = path.join(__dirname, '..', 'logs', 'application.log');
    // Ensure the logs directory exists
    if (!fs.existsSync(path.dirname(this.logFilePath))) {
      fs.mkdirSync(path.dirname(this.logFilePath), { recursive: true });
    }
  }

  log(message: string) {
    this.printToConsole('INFO', message);
    this.writeToFile('INFO', message);
  }

  error(message: string, trace: string) {
    this.printToConsole('ERROR', `${message} \nTrace: ${trace}`);
    this.writeToFile('ERROR', `${message} \nTrace: ${trace}`);
  }

  warn(message: string) {
    this.printToConsole('WARN', message);
    this.writeToFile('WARN', message);
  }

  debug(message: string) {
    this.printToConsole('DEBUG', message);
    this.writeToFile('DEBUG', message);
  }

  verbose(message: string) {
    this.printToConsole('VERBOSE', message);
    this.writeToFile('VERBOSE', message);
  }

  private printToConsole(level: string, message: string) {
    console.log(`[${level}] ${message}`);
  }

  private writeToFile(level: string, message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    fs.appendFileSync(this.logFilePath, logMessage, 'utf8');
  }
}