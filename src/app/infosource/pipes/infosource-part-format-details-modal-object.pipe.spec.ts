import { TestBed } from '@angular/core/testing';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { TranslateService } from '@ngx-translate/core';
import { FormatMonthPipe } from '@shared/pipes/format-month.pipe';
import { MockProvider } from 'ng-mocks';
import { InfosourceObjectMapKeys } from '../models/infosource.model';
import { InfosourceFormatDateRangePipe } from './infosource-format-date-range.pipe';
import { InfosourceFormatInformationPipe } from './infosource-format-information.pipe';
import { InfosourcePartFormatDetailsModalObjectPipe } from './infosource-part-format-details-modal-object.pipe';

describe('InfosourcePartFormatDetailsModalObjectPipe', () => {
  let pipe;
  let translate: TranslateService;
  let infosourceFormatDateRangePipe: InfosourceFormatDateRangePipe;
  let capitalizeFirstPipe: CapitalizeFirstPipe;
  let formatDatetimePipe: FormatDatetimePipe;
  let localizeDatePipe: LocalizedDatePipe;
  let infosourceFormatInfomationPipe: InfosourceFormatInformationPipe;
  let formatMonthPipe: FormatMonthPipe;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService, {}),
        MockProvider(InfosourceFormatDateRangePipe, {}),
        MockProvider(InfosourceFormatInformationPipe, {}),
        MockProvider(CapitalizeFirstPipe, {}),
        MockProvider(FormatDatetimePipe, {}),
        MockProvider(LocalizedDatePipe, {}),
        MockProvider(FormatMonthPipe, {})
      ]
    });
  });

  beforeEach(() => {
    translate = TestBed.inject(TranslateService);
    infosourceFormatDateRangePipe = TestBed.inject(InfosourceFormatDateRangePipe);
    infosourceFormatInfomationPipe = TestBed.inject(InfosourceFormatInformationPipe);
    capitalizeFirstPipe = TestBed.inject(CapitalizeFirstPipe);
    formatDatetimePipe = TestBed.inject(FormatDatetimePipe);
    localizeDatePipe = TestBed.inject(LocalizedDatePipe);
    formatMonthPipe = TestBed.inject(FormatMonthPipe);
    pipe = new InfosourcePartFormatDetailsModalObjectPipe(translate, infosourceFormatDateRangePipe, capitalizeFirstPipe, infosourceFormatInfomationPipe, formatDatetimePipe, localizeDatePipe, formatMonthPipe);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should format markupType', done => {
    const objectKeyValue = {
      'key': 'markupType',
      'value': 'BUOY'
    };
    const objectMap = {
      'objectName': 'feature 06',
      'markupType': 'BUOY'
    };
    const timezone = 'UTC+1';
    spyOn(translate, 'instant')
      .withArgs(`infosource.details.object-map.label.${objectKeyValue.key}`).and.returnValues('Type de balisage')
      .withArgs(`enum.infosource-markup-type.${objectKeyValue.value.toLowerCase()}`).and.returnValues('Bouée');
    const result = pipe.transform(objectKeyValue, objectMap, false, timezone);
    expect(result).toEqual('<span class="infosource-detail-label">Type de balisage :</span> Bouée');
    done();
  });

  it('should format objectName', done => {
    const objectKeyValue = {
      'key': 'objectName',
      'value': 'feature 06'
    };
    const objectMap = {
      'objectName': 'feature 06',
      'markupType': 'BUOY'
    };
    const timezone = 'UTC+1';
    spyOn(translate, 'instant')
      .withArgs(`infosource.details.object-map.label.${objectKeyValue.key}`).and.returnValues('Nom')
      .withArgs(`infosource.details.object-map.label-suffix.${objectMap[InfosourceObjectMapKeys.MARKUP_TYPE]}`).and.returnValues(' de la bouée');
    const result = pipe.transform(objectKeyValue, objectMap, false, timezone);
    expect(result).toEqual('<span class="infosource-detail-label">Nom de la bouée :</span> feature 06');
    done();
  });

  it('should format observationDate', done => {
    const objectKeyValue = {
      'key': 'observationDate',
      'value': '2022-03-14T07:22:00Z'
    };
    const objectMap = {
      'observationDate': '2022-03-14T07:22:00Z'
    };
    const timezone = 'UTC+1';
    spyOn(translate, 'instant').withArgs(`infosource.details.object-map.label.${objectKeyValue.key}`).and.returnValues('Date d\'observation');
    spyOn(formatDatetimePipe, 'transform').withArgs(objectKeyValue.value, 'UTC+1').and.returnValues('14/03/2022 08:22:00 UTC +01:00');
    const result = pipe.transform(objectKeyValue, objectMap, false, timezone);
    expect(result).toEqual('<span class="infosource-detail-label">Date d\'observation :</span> 14/03/2022 08:22:00 UTC +01:00');
    done();
  });

  it('should format dateRanges', done => {
    const objectKeyValue = {
      'key': 'dateRanges',
      'value': [
        {
          'start': '2022-01-01T01:01:01.000Z',
          'end': '2022-02-01T23:59:59.000Z'
        },
        {
          'start': '2022-01-01T01:01:01.000Z'
        },
        {
          'end': '2022-02-01T23:59:59.000Z'
        }
      ]
    };
    const objectMap = {
      'objectName': 'Name',
      'markupType': 'TURRET_BEACON',
      'dateRanges': [
        {
          'start': '2022-01-01T01:01:01.000Z',
          'end': '2022-02-01T23:59:59.000Z'
        },
        {
          'start': '2022-01-01T01:01:01.000Z'
        },
        {
          'end': '2022-02-01T23:59:59.000Z'
        }
      ],
      'observationDate': '2022-01-27T14:07:32.000Z',
      'mapNumber': 'Concerned map number',
      'editionNumber': 'Edition number',
      'lastPatchNumber': 'Last patch number',
      'issueReference': 'Concerned issue reference',
      'upToDateAt': 'Up-to-date at',
      'chapterOrPage': 'Chapter or page',
      'objectFutureInfo': 'Object'
    };
    const timezone = 'UTC+1';
    spyOn(translate, 'instant').withArgs(`infosource.details.object-map.label.${objectKeyValue.key}`).and.returnValues('Périodes des activités');
    spyOn(infosourceFormatDateRangePipe, 'transform')
      .withArgs({ 'start': '2022-01-01T01:01:01.000Z', 'end': '2022-02-01T23:59:59.000Z' }, 'UTC+1').and.returnValues('à partir du 01/01/2022 02:01:01 UTC +01:00 jusqu\'au 02/02/2022 00:59:59 UTC +01:00')
      .withArgs({ 'start': '2022-01-01T01:01:01.000Z' }, 'UTC+1').and.returnValues('à partir du 01/01/2022 02:01:01 UTC +01:00')
      .withArgs({ 'end': '2022-02-01T23:59:59.000Z' }, 'UTC+1').and.returnValues('jusqu\'au 02/02/2022 00:59:59 UTC +01:00');
    spyOn(capitalizeFirstPipe, 'transform')
      .withArgs('à partir du 01/01/2022 02:01:01 UTC +01:00 jusqu\'au 02/02/2022 00:59:59 UTC +01:00')
      .and.returnValues('À partir du 01/01/2022 02:01:01 UTC +01:00 jusqu\'au 02/02/2022 00:59:59 UTC +01:00')
      .withArgs('à partir du 01/01/2022 02:01:01 UTC +01:00')
      .and.returnValues('À partir du 01/01/2022 02:01:01 UTC +01:00')
      .withArgs('jusqu\'au 02/02/2022 00:59:59 UTC +01:00')
      .and.returnValues('Jusqu\'au 02/02/2022 00:59:59 UTC +01:00');
    const result = pipe.transform(objectKeyValue, objectMap, false, timezone);
    expect(result).toEqual('<span class="infosource-detail-label">Périodes des activités :</span> \nÀ partir du 01/01/2022 02:01:01 UTC +01:00 jusqu\'au 02/02/2022 00:59:59 UTC +01:00\nÀ partir du 01/01/2022 02:01:01 UTC +01:00\nJusqu\'au 02/02/2022 00:59:59 UTC +01:00\n');
    done();
  });

  it('should format georegulation type', done => {
    const objectKeyValue = {
      'key': 'georegulationType',
      'value': 'NAVIGATION'
    };
    const objectMap = {
      'georegulationType': 'NAVIGATION',
      'georegulationTitle': 'a title'
    };
    const timezone = 'UTC+1';
    spyOn(translate, 'instant')
      .withArgs(`infosource.objects.object-map.label.${objectKeyValue.key}`).and.returnValues('Type')
      .withArgs(`georegulation.type.${objectKeyValue.value}`).and.returnValues('Navigation')
    const result = pipe.transform(objectKeyValue, objectMap, true, timezone);
    expect(result).toEqual('<span class="infosource-detail-label">Type :</span> Navigation');
    done();
  });
});
