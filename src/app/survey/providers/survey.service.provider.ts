import { AuthService } from '@app/auth/auth.service';
import { SurveyAdminApi } from '../api/survey-admin.api';
import { SurveyApi } from '../api/survey.api';
import { SurveyAdminService } from '../services/survey-admin.service';
import { AbstractSurveyService, SurveyService } from '../services/survey.service';

const surveyServiceFactory = (
  authService: AuthService,
  surveyApi: SurveyApi, 
  surveyAdminApi: SurveyAdminApi) => authService.isPublicUser() ? new SurveyService(surveyApi) : new SurveyAdminService(surveyAdminApi);

export const surveyServiceProvider = {
  provide: AbstractSurveyService,
  useFactory: surveyServiceFactory,
  deps: [
    AuthService, 
    SurveyApi, 
    SurveyAdminApi
  ]
};
