/*jshiint expr:true*/
/*global angular, describe, xit, it, beforeEach, afterEach*/

describe('Home Controller', function() {
    var scope, httpBackend, createCtrl, homeCtrl, githubResponse, $HUB, $RAW, $RPCService;

    var testDataRepos = {
        data: [{
            'id': 1296269,
            'owner': {
                'login': 'octocat',
                'id': 1,
                'avatar_url': 'https://github.com/images/error/octocat_happy.gif',
                'gravatar_id': '',
                'url': 'https://api.github.com/users/octocat',
                'html_url': 'https://github.com/octocat',
                'followers_url': 'https://api.github.com/users/octocat/followers',
                'following_url': 'https://api.github.com/users/octocat/following{/other_user}',
                'gists_url': 'https://api.github.com/users/octocat/gists{/gist_id}',
                'starred_url': 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
                'subscriptions_url': 'https://api.github.com/users/octocat/subscriptions',
                'organizations_url': 'https://api.github.com/users/octocat/orgs',
                'repos_url': 'https://api.github.com/users/octocat/repos',
                'events_url': 'https://api.github.com/users/octocat/events{/privacy}',
                'received_events_url': 'https://api.github.com/users/octocat/received_events',
                'type': 'User',
                'site_admin': false
            },
            'name': 'Hello-World',
            'full_name': 'octocat/Hello-World',
            'description': 'This your first repo!',
            'private': false,
            'fork': false,
            'url': 'https://api.github.com/repos/octocat/Hello-World',
            'html_url': 'https://github.com/octocat/Hello-World',
            'permissions': {
                'admin': false,
                'push': true,
                'pull': true
            }
        }, {
            id: 123,
            owner: {
                login: 'orgOwner'
            },
            permissions: {
                admin: false,
                push: true,
                pull: true
            }
        }, {
            id: 456,
            owner: {
                login: 'orgOwner'
            },
            permissions: {
                admin: false,
                push: false,
                pull: true
            }
        }]
    };

    var testDataGists = {
        data: [{
            'url': 'https://api.github.com/gists/aa5a315d61ae9438b18d',
            'forks_url': 'https://api.github.com/gists/aa5a315d61ae9438b18d/forks',
            'commits_url': 'https://api.github.com/gists/aa5a315d61ae9438b18d/commits',
            'id': 'aa5a315d61ae9438b18d',
            'description': 'description of gist',
            'public': true,
            'owner': {
                'login': 'octocat',
                'id': 1,
                'avatar_url': 'https://github.com/images/error/octocat_happy.gif',
                'gravatar_id': '',
                'url': 'https://api.github.com/users/octocat',
                'html_url': 'https://github.com/octocat',
                'followers_url': 'https://api.github.com/users/octocat/followers',
                'following_url': 'https://api.github.com/users/octocat/following{/other_user}',
                'gists_url': 'https://api.github.com/users/octocat/gists{/gist_id}',
                'starred_url': 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
                'subscriptions_url': 'https://api.github.com/users/octocat/subscriptions',
                'organizations_url': 'https://api.github.com/users/octocat/orgs',
                'repos_url': 'https://api.github.com/users/octocat/repos',
                'events_url': 'https://api.github.com/users/octocat/events{/privacy}',
                'received_events_url': 'https://api.github.com/users/octocat/received_events',
                'type': 'User',
                'site_admin': false
            },
            'user': null,
            'files': {
                'ring.erl': {
                    'size': 932,
                    'raw_url': 'https://gist.githubusercontent.com/raw/365370/8c4d2d43d178df44f4c03a7f2ac0ff512853564e/ring.erl',
                    'type': 'text/plain',
                    'truncated': false,
                    'language': 'Erlang'
                }
            },
            'comments': 0,
            'comments_url': 'https://api.github.com/gists/aa5a315d61ae9438b18d/comments/',
            'html_url': 'https://gist.github.com/aa5a315d61ae9438b18d',
            'git_pull_url': 'https://gist.github.com/aa5a315d61ae9438b18d.git',
            'git_push_url': 'https://gist.github.com/aa5a315d61ae9438b18d.git',
            'created_at': '2010-04-14T02:15:15Z',
            'updated_at': '2011-06-20T11:34:15Z'
        }]
    };
    var getAllReposData;
    var getAllReposError;
    var rpcRepoGetAllData;
    var rpcRepoGetAllError;
    var rpcRepoCreate;

    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(angular.mock.inject(function($injector, $rootScope, $controller, _$HUB_, _$RPCService_, _$RAW_) {
        $HUB = _$HUB_;
        $RAW = _$RAW_;
        $RPCService = _$RPCService_;
        httpBackend = $injector.get('$httpBackend');

        scope = $rootScope.$new();

        var hubDirectCall = $HUB.direct_call;
        sinon.stub($HUB, 'direct_call', function(url, data, cb) {
            var response = getAllReposData || {
                    value: testDataRepos.data
                };
            var error = getAllReposError ? getAllReposError : null;

            if (url.indexOf('https://api.github.com/user/repos') > -1) {
                (url.indexOf('affiliation=owner,organization_member')).should.be.greaterThan(-1);
                if (response.getMore) {
                    response.cb = cb;
                }
            } else {
                hubDirectCall(url, data, cb);
                return;
            }
            cb(error, response);
        });

        var rpcCall = $RPCService.call;
        sinon.stub($RPCService, 'call', function(o, f, args, cb) {
            var response;
            var error;
            if (o === 'repo' && f === 'getAll') {
                args.set[0].repo.should.be.ok;
                args.set[0].repoId.should.be.ok;

                response = rpcRepoGetAllData || {
                    value: [{
                        repo: 'Hello-World',
                        owner: 'octocat',
                        gist: 1234
                    }]
                };
                error = rpcRepoGetAllError ? rpcRepoGetAllError : null;
            } else if (o === 'repo' && f === 'create') {
                args.repoId.should.be.equal(123);
                args.gist.should.be.equal(homeCtrl.scope.selectedGist.gist.url);

                response = rpcRepoCreate && !rpcRepoCreate.error ? rpcRepoCreate.value : {
                    value: true
                };
                error = rpcRepoCreate && rpcRepoCreate.error ? rpcRepoCreate.error : null;
            } else {
                return rpcCall(o, f, args, cb);
            }
            cb(error, response);
        });

        var rawGet = $RAW.get;
        sinon.stub($RAW, 'get', function(url, token) {
            if (url.indexOf('count') > -1) {
                return {
                    then: function() {}
                };
            } else {
                return rawGet(url, token);
            }
        });

        createCtrl = function() {
            var ctrl = $controller('HomeCtrl', {
                $scope: scope
            });
            ctrl.scope = scope;
            return ctrl;
        };

        homeCtrl = createCtrl();
        githubResponse = {
            data: {
                login: 'login'
            },
            meta: {
                scopes: 'user:email, repo, repo:status, read:repo_hook, write:repo_hook, read:org'
            }
        };
        httpBackend.when('GET', '/config').respond({});
        httpBackend.when('POST', '/api/github/call', {
            obj: 'user',
            fun: 'get',
            arg: {}
        }).respond(githubResponse);

        httpBackend.when('POST', '/api/github/direct_call', {
            url: 'https://api.github.com/gists?per_page=100'
        }).respond(testDataGists.data.concat(
            [{
                html_url: 'https://gist.github.com/gistId',
                files: {
                    'file.txt': {
                        filename: 'file1'
                    }
                }
            }]));
        httpBackend.when('GET', '/static/cla-assistant.json').respond({
            'default-cla': [{
                'name': 'first default cla',
                'url': 'https://gist.github.com/gistId'
            }]
        });

    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
        homeCtrl.scope.selectedRepo = {};
        homeCtrl.scope.selectedGist = {};

        $HUB.direct_call.restore();
        $RAW.get.restore();
        $RPCService.call.restore();
        getAllReposData = undefined;
        getAllReposError = undefined;
        rpcRepoGetAllData = undefined;
        rpcRepoGetAllError = undefined;
    });

    it('should get user repos and mix claRepos data with repos data if user has admin rights', function() {
        httpBackend.flush();
        (homeCtrl.scope.repos.length).should.be.equal(2);
        (homeCtrl.scope.claRepos.length).should.be.equal(1);
        (homeCtrl.scope.user.value.admin).should.be.equal(true);
        (homeCtrl.scope.claRepos[0].fork).should.be.equal(testDataRepos.data[0].fork);
    });

    it('should get more repos if there are more to load', function() {
        var getMoreCalled = false;
        getAllReposData = {
            value: testDataRepos.data,
            hasMore: true,
            getMore: function() {
                getMoreCalled = true;
            }
        };
        httpBackend.flush();
        (getMoreCalled).should.be.equal(true);
    });

    it('should update scope.repos when all repos loaded first', function() {
        getAllReposData = {
            value: testDataRepos.data,
            hasMore: true,
            getMore: function() {
                this.hasMore = false;
                this.value.push({
                    id: 123,
                    name: 'test',
                    owner: {
                        login: 'octocat'
                    },
                    permissions: {
                        admin: false,
                        push: true,
                        pull: true
                    }
                });
                this.cb(null, this);
            }
        };

        httpBackend.flush();
        (scope.repos.length).should.be.equal(3);
    });

    it('should not load user repos if github call failed', function() {
        getAllReposError = 'Github call failed';

        httpBackend.flush();
        (homeCtrl.scope.repos.length).should.be.equal(0);
        ($RPCService.call.called).should.be.equal(false);
    });

    it('should not load user repos if db call failed', function() {
        rpcRepoGetAllError = 'Could not find entries on DB';

        httpBackend.flush();
        (homeCtrl.scope.claRepos.length).should.be.equal(0);
    });

    it('should not load user`s repos if he is not an admin', function() {
        githubResponse.meta.scopes = 'user:email';
        httpBackend.resetExpectations();

        httpBackend.flush();
        (homeCtrl.scope.repos.length).should.be.equal(0);
        (homeCtrl.scope.user.value.admin).should.be.equal(false);
    });

    it('should not try to get linked repos if user has no repos in GitHub', function() {
        getAllReposData = {
            value: []
        };

        httpBackend.flush();
        (homeCtrl.scope.repos.length).should.be.equal(0);
    });

    it('should create repo entry and webhook on link action', function() {
        httpBackend.flush();

        homeCtrl.scope.repos = [{
            name: 'myRepo',
            owner: {
                login: 'login'
            },
            fork: true
        }];

        homeCtrl.scope.selectedRepo.repo = {
            id: 123,
            name: 'myRepo',
            full_name: 'login/myRepo',
            owner: {
                login: 'login'
            }
        };
        homeCtrl.scope.selectedGist.gist = {
            url: 'https://gist.github.com/gistId'
        };

        httpBackend.expect('POST', '/api/webhook/create', {
            repo: 'myRepo',
            owner: 'login'
        }).respond({
            active: true
        });

        homeCtrl.scope.link();
        httpBackend.flush();
        (homeCtrl.scope.claRepos.length).should.be.equal(2);
        (homeCtrl.scope.claRepos[1].repo).should.be.equal('myRepo');
        (homeCtrl.scope.claRepos[1].active).should.be.ok;
        (homeCtrl.scope.claRepos[1].fork).should.be.ok;
    });

    it('should set active flag depending on webhook response', function() {
        httpBackend.flush();

        homeCtrl.scope.repos = [{
            name: 'myRepo',
            owner: {
                login: 'login'
            },
            fork: true
        }];

        homeCtrl.scope.selectedRepo.repo = {
            id: 123,
            name: 'myRepo',
            full_name: 'login/myRepo',
            owner: {
                login: 'login'
            }
        };
        homeCtrl.scope.selectedGist.gist = {
            url: 'https://gist.github.com/gistId'
        };

        httpBackend.expect('POST', '/api/webhook/create', {
            repo: 'myRepo',
            owner: 'login'
        }).respond({
            active: false
        });

        homeCtrl.scope.link();
        httpBackend.flush();
        (homeCtrl.scope.claRepos[1].repo).should.be.equal('myRepo');
        (homeCtrl.scope.claRepos[1].active).should.be.not.ok;
    });

    it('should remove repo from claRepos list and remove webhook from github if create failed on backend', function() {
        httpBackend.flush();

        homeCtrl.scope.repos = [{
            name: 'myRepo',
            owner: {
                login: 'login'
            },
            fork: true
        }];

        homeCtrl.scope.selectedGist.gist = {
            url: 'https://gist.github.com/gistId'
        };
        homeCtrl.scope.selectedRepo.repo = {
            id: 123,
            name: 'myRepo',
            full_name: 'login/myRepo',
            owner: {
                login: 'login'
            }
        };

        rpcRepoCreate = {
            value: false
        };

        httpBackend.expect('POST', '/api/webhook/remove', {
            repo: 'myRepo',
            user: 'login'
        }).respond({});
        httpBackend.expect('POST', '/api/webhook/create', {
            repo: 'myRepo',
            owner: 'login'
        }).respond(null, {
            active: true
        });

        homeCtrl.scope.link();
        httpBackend.flush();
        (homeCtrl.scope.claRepos.length).should.be.equal(1);
    });

    it('should show error message if create failed', function() {
        httpBackend.flush();

        homeCtrl.scope.selectedGist.gist = {
            url: 'https://gist.github.com/gistId'
        };
        homeCtrl.scope.selectedRepo.repo = {
            id: 123,
            name: 'myRepo',
            full_name: 'login/myRepo',
            owner: {
                login: 'login'
            }
        };

        rpcRepoCreate = {
            error: {
                err: 'nsertDocument :: caused by :: 11000 E11000 duplicate key error index: cla-staging.repos.$repo_1_owner_1  dup key: { : "myRepo", : "login" }'
            }
        };

        httpBackend.expect('POST', '/api/webhook/remove', {
            repo: 'myRepo',
            user: 'login'
        }).respond({});
        httpBackend.expect('POST', '/api/webhook/create', {
            repo: 'myRepo',
            owner: 'login'
        }).respond(null, {
            active: true
        });

        homeCtrl.scope.link();
        httpBackend.flush();
        (homeCtrl.scope.errorMsg[0]).should.be.equal('This repository is already set up.');
    });

    it('should check repos whether they are activated or NOT', function() {
        rpcRepoGetAllData = {
            value: [{
                name: 'Hello-World',
                owner: 'octocat',
                gist: ''
            }]
        };
        httpBackend.flush();
        (homeCtrl.scope.claRepos[0].active).should.not.be.ok;
    });

    it('should check repos whether they are ACTIVATED or not', function() {
        httpBackend.flush();
        (homeCtrl.scope.claRepos[0].active).should.be.ok;
        (homeCtrl.scope.claRepos[0].gist).should.be.ok;
    });

    it('should delete db entry and webhook on remove', function() {
        httpBackend.flush();

        httpBackend.expect('POST', '/api/repo/remove', {
            repo: 'myRepo',
            owner: 'login',
            gist: 'https://gist.github.com/myRepo/2'
        }).respond();
        httpBackend.expect('POST', '/api/webhook/remove', {
            repo: 'myRepo',
            user: 'login'
        }).respond();

        var repo = {
            repo: 'myRepo',
            owner: 'login',
            gist: 'https://gist.github.com/myRepo/2',
            active: true
        };
        homeCtrl.scope.claRepos = [repo];
        homeCtrl.scope.remove(repo);

        httpBackend.flush();
        (homeCtrl.scope.claRepos.length).should.be.equal(0);
    });

    // it('should get all users signed this cla', function(){
    //     var claRepo = {repo: 'myRepo', owner: 'login', gist: 'url'};
    //     httpBackend.expect('POST', '/api/cla/getAll', {repo: claRepo.repo, owner: claRepo.owner, gist: {gist_url: claRepo.gist}}).respond([{user: 'login'}]);
    //     httpBackend.expect('POST', '/api/github/call', {obj: 'user', fun: 'getFrom', arg: {user: 'login'}}).respond({id: 12, login: 'login', name: 'name'});
    //
    //     homeCtrl.scope.getUsers(claRepo);
    //       httpBackend.flush();
    //
    //     (homeCtrl.scope.users.length).should.be.equal(1);
    // });

    it('should load gist files of the user', function() {
        httpBackend.flush();
        (homeCtrl.scope.gists.length).should.be.equal(3);
        (homeCtrl.scope.gists[0].name).should.be.equal('first default cla');
        (homeCtrl.scope.gists[1].name).should.be.equal('ring.erl');
        (homeCtrl.scope.gists[2].name).should.be.equal('file1');
    });

    it('should validate gist url', function() {
        httpBackend.flush();
        var invalidUrls = ['https://google.com', '', undefined];

        invalidUrls.forEach(function(url) {
            homeCtrl.scope.isValid(url).should.not.be.ok;
        });
    });

    it('should identify default gist url from all gists', function() {
        httpBackend.flush();

        var sapClaGist = {
            name: 'first default cla',
            url: 'https://gist.github.com/gistId'
        };
        (homeCtrl.scope.groupDefaultCla(sapClaGist)).should.be.equal('Default CLAs');

        var anyOtherGist = {
            name: 'any name',
            url: 'https://gist.github.com/gitID'
        };
        (homeCtrl.scope.groupDefaultCla(anyOtherGist)).should.not.be.equal('Default CLAs');
    });

    it('should load default cla files', function() {
        httpBackend.flush();

        homeCtrl.scope.defaultClas.length.should.be.equal(1);
        homeCtrl.scope.defaultClas[0].name.should.be.equal('first default cla');
    });

    it('should clear selected repo on clear function', function() {
        httpBackend.flush();
        var ev = {
            stopPropagation: function() {}
        };
        homeCtrl.scope.selectedRepo.repo = {
            name: 'any test repo'
        };

        homeCtrl.scope.clear(ev, 'repo');
        (!homeCtrl.scope.selectedRepo.repo).should.be.ok;
    });

    it('should clear selected cla on clear function', function() {
        httpBackend.flush();
        var ev = {
            stopPropagation: function() {}
        };
        homeCtrl.scope.selectedGist.gist = {
            url: 'any_test_url'
        };

        homeCtrl.scope.clear(ev, 'gist');
        (!homeCtrl.scope.selectedGist.gist).should.be.ok;
    });

    it('should NOT load counts if user is logged', function() {
        httpBackend.flush();
        ($RAW.get.calledWith('/count/clas')).should.be.equal(false);
    });

    it('should load counts if user not logged', function() {
        httpBackend.expect('POST', '/api/github/call', {
            obj: 'user',
            fun: 'get',
            arg: {}
        }).respond(401, 'Authentication required');
        httpBackend.flush();
        ($RAW.get.called).should.be.equal(true);
    });
});