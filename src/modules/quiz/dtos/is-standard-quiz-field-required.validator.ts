import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';

export function IsStandardQuizFieldRequired(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStandardQuizFieldRequired',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const quizType = (args.object as any).quizType;
          console.log('[IsStandardQuizFieldRequired]', {
            property: args.property,
            value,
            quizType,
          });
          if (quizType === QuizTypeEnum.Standard) {
            // For Standard, require non-empty string for all fields
            return typeof value === 'string' && value.trim().length > 0;
          }
          return true; // For UserQuiz, allow undefined, null, or empty string--
        },
        defaultMessage(args: ValidationArguments) {
          if (args.property === 'title')
            return 'Title is required for Standard quiz';
          if (args.property === 'description')
            return 'Description is required for Standard quiz';
          if (args.property === 'questionIds')
            return 'questionIds is required for Standard quiz';
          return `${args.property} is required for Standard quiz`;
        },
      },
    });
  };
}

export function IsSubjectOrTopicRequired(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSubjectOrTopicRequired',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(_value: any, args: ValidationArguments) {
          const subject = (args.object as any).subjectIds;
          const topic = (args.object as any).topicIds;
          return (
            (typeof subject === 'string' && subject.trim().length > 0) ||
            (typeof topic === 'string' && topic.trim().length > 0)
          );
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Either subjectIds or topicIds is required';
        },
      },
    });
  };
}
