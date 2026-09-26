# Support ticket test phrases

Набор обращений для ручного и автоматизированного тестирования вывода моделей в `POST /tickets/analyze`.

Цель набора - проверить, что разные LLM provider'ы стабильно возвращают валидный `TicketAnalysis`: категорию, приоритет, краткое summary, язык и признак необходимости передачи человеку.

## Как использовать

1. Отправлять каждую фразу в `POST /tickets/analyze`.
2. Сравнивать результат между `LLM_PROVIDER=openai` и `LLM_PROVIDER=local`.
3. Фиксировать минимум:
   - валидность схемы;
   - корректность категории;
   - адекватность приоритета;
   - необходимость передачи оператору;
   - latency;
   - failures.

## Test phrases

| # | Phrase | Expected area |
|---|---|---|
| 1 | Не могу войти в аккаунт после смены телефона. Код подтверждения приходит на старый номер. | authentication |
| 2 | Забыл пароль, а письмо для восстановления не приходит уже 20 минут. | authentication |
| 3 | При входе пишет "invalid credentials", хотя пароль точно правильный. | authentication |
| 4 | Аккаунт заблокирован после нескольких попыток входа. Нужно срочно восстановить доступ. | authentication |
| 5 | I cannot log in because the 2FA code never arrives on my phone. | authentication |
| 6 | После обновления приложения меня разлогинило, а повторный вход зависает на белом экране. | authentication |
| 7 | У меня новый email, но подтвердить его не получается: ссылка из письма уже истекла. | authentication |
| 8 | Кто-то вошел в мой аккаунт без разрешения. Срочно заблокируйте доступ. | authentication |
| 9 | Не могу удалить старое устройство из списка доверенных устройств. | authentication |
| 10 | Password reset link opens an error page saying the token is invalid. | authentication |
| 11 | С карты списали деньги два раза за одну подписку. Верните лишний платеж. | billing |
| 12 | Оплатил тариф Pro, но в кабинете все еще отображается бесплатный план. | billing |
| 13 | Не получается привязать карту: форма оплаты возвращает ошибку без пояснения. | billing |
| 14 | Нужен счет для бухгалтерии за оплату подписки в этом месяце. | billing |
| 15 | I cancelled my subscription yesterday, but I was charged again today. | billing |
| 16 | Промокод применился, но скидка в итоговой сумме не появилась. | billing |
| 17 | Не могу скачать закрывающие документы за прошлый квартал. | billing |
| 18 | После смены тарифа списалась полная сумма, хотя обещали перерасчет. | billing |
| 19 | Payment failed, but the money is reserved on my bank account. | billing |
| 20 | Хочу узнать, почему стоимость продления стала выше без уведомления. | billing |
| 21 | Приложение падает при загрузке файла больше 10 МБ. | technical |
| 22 | API возвращает 500 на запрос создания тикета, хотя payload соответствует документации. | technical |
| 23 | Страница отчетов открывается очень медленно и иногда показывает пустой список. | technical |
| 24 | После последнего релиза кнопка "Сохранить" перестала работать в Safari. | technical |
| 25 | Webhook is delivered with a 30-minute delay and breaks our integration. | technical |
| 26 | В мобильном приложении не отображаются вложения, хотя в веб-версии они есть. | technical |
| 27 | Экспорт CSV содержит неправильную кодировку, русские символы превращаются в вопросительные знаки. | technical |
| 28 | При попытке загрузить аватар получаю ошибку "unsupported file type" для обычного PNG. | technical |
| 29 | Сервис периодически отдает timeout при поиске по клиентам. | technical |
| 30 | После импорта данных часть записей продублировалась, а часть пропала. | technical |
| 31 | Здравствуйте, подскажите, где посмотреть историю обращений? | other |
| 32 | Хочу изменить название компании в профиле организации. | other |
| 33 | Можно ли перенести данные из старого аккаунта в новый? | other |
| 34 | Подскажите, есть ли у вас партнерская программа для агентств? | other |
| 35 | I need to change the workspace owner because the previous employee left the company. | other |
| 36 | Как удалить мой аккаунт и все персональные данные? | other |
| 37 | Нужна консультация по настройке команды из 15 сотрудников. | other |
| 38 | Где найти документацию по интеграции с CRM? | other |
| 39 | Можно ли временно заморозить аккаунт на время отпуска? | other |
| 40 | Please update our company address in billing and legal documents. | other |
| 41 | Не могу войти, подписка почему-то не активна, а поддержка в чате не отвечает уже час. | mixed: authentication, billing |
| 42 | После оплаты тарифа API все равно возвращает 403, хотя доступ должен быть открыт. | mixed: billing, technical |
| 43 | У нас не работает экспорт, а завтра сдача отчетности. Очень срочно. | technical, high priority |
| 44 | Клиент случайно удалил проект со всеми данными. Можно ли восстановить? | technical, high priority |
| 45 | Someone changed the owner email and now our team is locked out of the workspace. | authentication, high priority |
| 46 | Просто не работает. | ambiguous |
| 47 | Ошибка. | ambiguous |
| 48 | Все пропало после обновления, ничего не открывается, помогите срочно. | ambiguous, high priority |
| 49 | Я оплатил, вошел, но данные не синхронизируются между вебом и мобильным приложением. | mixed |
| 50 | Bonjour, je ne peux pas acceder a mon compte apres avoir change mon numero de telephone. | authentication, non-Russian |

