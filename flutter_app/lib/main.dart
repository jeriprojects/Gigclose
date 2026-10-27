import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

const _supabaseUrl = 'https://sumradexrcfqdqbyrcdi.supabase.co';
const _supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bXJhZGV4cmNmcWRxYnlyY2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTA4NTcsImV4cCI6MjA5MjEyNjg1N30.Fulr2nRn-Wwey5mNk-h_LLx1yJWz2maiNN_3sKnL15g';

const _brandInk = Color(0xFF0F172A);
const _brandBlue = Color(0xFF1D4ED8);
const _brandSky = Color(0xFFE0F2FE);
const _brandSurface = Color(0xFFF8FAFC);
const _brandSlate = Color(0xFF475569);
const _brandLine = Color(0xFFD9E5F4);

final supabase = Supabase.instance.client;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(url: _supabaseUrl, anonKey: _supabaseAnonKey);
  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  runApp(const GigsCloseApp());
}

class GigsCloseApp extends StatelessWidget {
  const GigsCloseApp({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: _brandBlue,
      primary: _brandBlue,
      surface: Colors.white,
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GigsClose',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: colorScheme,
        scaffoldBackgroundColor: _brandSurface,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          foregroundColor: _brandInk,
          systemOverlayStyle: SystemUiOverlayStyle.dark,
        ),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: _brandInk,
          contentTextStyle: const TextStyle(color: Colors.white),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: _brandLine),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: _brandLine),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: _brandBlue, width: 1.2),
          ),
        ),
      ),
      home: const NativeAppShell(),
    );
  }
}

class NativeAppShell extends StatefulWidget {
  const NativeAppShell({super.key});

  @override
  State<NativeAppShell> createState() => _NativeAppShellState();
}

class _NativeAppShellState extends State<NativeAppShell> {
  final Connectivity _connectivity = Connectivity();
  late final StreamSubscription<List<ConnectivityResult>> _connectivitySub;
  late final StreamSubscription<AuthState> _authSub;

  int _index = 0;
  bool _offline = false;
  Session? _session = supabase.auth.currentSession;

  @override
  void initState() {
    super.initState();
    _syncConnectivity();
    _connectivitySub = _connectivity.onConnectivityChanged.listen((results) {
      if (!mounted) return;
      setState(() => _offline = results.contains(ConnectivityResult.none));
    });
    _authSub = supabase.auth.onAuthStateChange.listen((data) {
      if (!mounted) return;
      setState(() => _session = data.session);
    });
  }

  Future<void> _syncConnectivity() async {
    final results = await _connectivity.checkConnectivity();
    if (!mounted) return;
    setState(() => _offline = results.contains(ConnectivityResult.none));
  }

  @override
  void dispose() {
    _connectivitySub.cancel();
    _authSub.cancel();
    super.dispose();
  }

  void _openJob(JobRecord job) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => JobDetailScreen(
          jobId: job.id,
          session: _session,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(
        session: _session,
        offline: _offline,
        onOpenExplore: () => setState(() => _index = 1),
        onOpenAccount: () => setState(() => _index = 2),
        onOpenJob: _openJob,
      ),
      ExploreScreen(
        session: _session,
        onOpenAccount: () => setState(() => _index = 2),
        onOpenJob: _openJob,
      ),
      AccountScreen(session: _session),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.travel_explore_outlined),
            selectedIcon: Icon(Icons.travel_explore_rounded),
            label: 'Explore',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Account',
          ),
        ],
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.session,
    required this.offline,
    required this.onOpenExplore,
    required this.onOpenAccount,
    required this.onOpenJob,
  });

  final Session? session;
  final bool offline;
  final VoidCallback onOpenExplore;
  final VoidCallback onOpenAccount;
  final ValueChanged<JobRecord> onOpenJob;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<JobRecord>> _jobsFuture;

  @override
  void initState() {
    super.initState();
    _jobsFuture = _fetchJobs();
  }

  Future<List<JobRecord>> _fetchJobs() async {
    final response = await supabase
        .from('jobs')
        .select()
        .eq('status', 'open')
        .order('created_at', ascending: false)
        .limit(48);
    return response.map(JobRecord.fromMap).toList();
  }

  Future<void> _refresh() async {
    final jobs = await _fetchJobs();
    if (!mounted) return;
    setState(() => _jobsFuture = Future.value(jobs));
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<JobRecord>>(
          future: _jobsFuture,
          builder: (context, snapshot) {
            final jobs = snapshot.data ?? const <JobRecord>[];
            final featured = jobs.take(6).toList();
            final grouped = groupJobsByCategory(featured);
            final categories = categoryMeta.entries
                .map(
                  (entry) => _CategoryBlock(
                    slug: entry.key,
                    label: entry.value.label,
                    icon: entry.value.icon,
                    tone: entry.value.tone,
                    count: jobs.where((job) => job.category == entry.key).length,
                    jobs: grouped[entry.key] ?? const <JobRecord>[],
                  ),
                )
                .toList();

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              children: [
                if (widget.offline)
                  const _StatusBanner(
                    text:
                        'You are offline. The app keeps its native layout, but live jobs and dashboard data will refresh when your connection returns.',
                    tone: _StatusTone.warning,
                  ),
                if (snapshot.hasError)
                  _StatusBanner(
                    text:
                        'We could not refresh the marketplace right now. Pull down to retry.',
                    tone: _StatusTone.error,
                    actionLabel: 'Retry',
                    onAction: _refresh,
                  ),
                _HeroCard(
                  signedIn: widget.session != null,
                  onExplore: widget.onOpenExplore,
                  onAccount: widget.onOpenAccount,
                ),
                const SizedBox(height: 24),
                const _SectionIntro(
                  eyebrow: 'Live marketplace',
                  title: 'A native home built around real jobs, not a web wrapper.',
                  body:
                      'The APK now talks to Supabase directly, keeps the same GigsClose feel, and stays useful across phone sizes without relying on the website.',
                ),
                const SizedBox(height: 16),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final columns = constraints.maxWidth >= 980
                        ? 4
                        : constraints.maxWidth >= 700
                        ? 2
                        : 1;
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: categories.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: columns,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: columns == 1 ? 1.25 : 1.08,
                      ),
                      itemBuilder: (context, index) {
                        final category = categories[index];
                        return _CategoryCard(
                          block: category,
                          onTap: widget.onOpenExplore,
                        );
                      },
                    );
                  },
                ),
                const SizedBox(height: 28),
                const _SectionIntro(
                  eyebrow: 'Featured jobs',
                  title: 'Fresh openings with clear pay and exact locations.',
                  body:
                      'Detailed location text and category grouping carry over into the app, so discovery stays sharp instead of broad and fuzzy.',
                ),
                const SizedBox(height: 16),
                if (snapshot.connectionState == ConnectionState.waiting &&
                    jobs.isEmpty)
                  const _LoadingStack(count: 3)
                else if (featured.isEmpty)
                  const _EmptyCard(
                    title: 'No live jobs yet',
                    body:
                        'As new openings land in Supabase they will appear here automatically.',
                  )
                else
                  ...featured.map(
                    (job) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: JobListCard(
                        job: job,
                        onTap: () => widget.onOpenJob(job),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({
    super.key,
    required this.session,
    required this.onOpenAccount,
    required this.onOpenJob,
  });

  final Session? session;
  final VoidCallback onOpenAccount;
  final ValueChanged<JobRecord> onOpenJob;

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  late Future<List<JobRecord>> _jobsFuture;
  final TextEditingController _searchController = TextEditingController();
  String _activeCategory = 'all';

  @override
  void initState() {
    super.initState();
    _jobsFuture = _fetchJobs();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<List<JobRecord>> _fetchJobs() async {
    final response = await supabase
        .from('jobs')
        .select()
        .eq('status', 'open')
        .order('urgent', ascending: false)
        .order('created_at', ascending: false)
        .limit(120);
    return response.map(JobRecord.fromMap).toList();
  }

  Future<void> _refresh() async {
    final jobs = await _fetchJobs();
    if (!mounted) return;
    setState(() => _jobsFuture = Future.value(jobs));
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<JobRecord>>(
          future: _jobsFuture,
          builder: (context, snapshot) {
            final allJobs = snapshot.data ?? const <JobRecord>[];
            final filtered = allJobs.where((job) {
              if (_activeCategory != 'all' && job.category != _activeCategory) {
                return false;
              }
              return matchesAllSearchTerms(job, _searchController.text);
            }).toList();
            final grouped = groupJobsByCategory(filtered);

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              children: [
                const _TopBar(
                  title: 'Explore jobs',
                  subtitle:
                      'Search every word directly across title, description, category, and detailed location.',
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    hintText: 'Search job title, location, category, or keywords',
                    prefixIcon: Icon(Icons.search_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  height: 42,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _CategoryChip(
                        label: 'All',
                        selected: _activeCategory == 'all',
                        onTap: () => setState(() => _activeCategory = 'all'),
                      ),
                      ...categoryMeta.entries.map(
                        (entry) => Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: _CategoryChip(
                            label: entry.value.label,
                            selected: _activeCategory == entry.key,
                            onTap: () =>
                                setState(() => _activeCategory = entry.key),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                if (snapshot.hasError)
                  _StatusBanner(
                    text:
                        'Marketplace refresh failed. Pull down to retry and we will request fresh data from Supabase again.',
                    tone: _StatusTone.error,
                    actionLabel: 'Retry',
                    onAction: _refresh,
                  )
                else if (snapshot.connectionState == ConnectionState.waiting &&
                    allJobs.isEmpty)
                  const _LoadingStack(count: 5)
                else if (filtered.isEmpty)
                  _EmptyCard(
                    title: 'No exact matches',
                    body:
                        _searchController.text.trim().isEmpty
                            ? 'There are no open jobs in this category right now.'
                            : 'Every search term must match directly, including detailed location words. Try a shorter or more exact query.',
                  )
                else
                  ...grouped.entries.map(
                    (entry) => Padding(
                      padding: const EdgeInsets.only(bottom: 24),
                      child: _CategoryResultsSection(
                        label: categoryMeta[entry.key]!.label,
                        icon: categoryMeta[entry.key]!.icon,
                        jobs: entry.value,
                        onOpenJob: widget.onOpenJob,
                      ),
                    ),
                  ),
                if (widget.session == null) ...[
                  const SizedBox(height: 12),
                  _PromptCard(
                    title: 'Sign in to apply',
                    body:
                        'You can explore freely, then jump to account when you are ready to apply or manage your dashboard.',
                    actionLabel: 'Open account',
                    onAction: widget.onOpenAccount,
                  ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }
}

class JobDetailScreen extends StatefulWidget {
  const JobDetailScreen({
    super.key,
    required this.jobId,
    required this.session,
  });

  final String jobId;
  final Session? session;

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  late Future<_JobDetailBundle> _detailFuture;
  final TextEditingController _noteController = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _detailFuture = _fetchDetail();
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  Future<_JobDetailBundle> _fetchDetail() async {
    final jobResponse =
        await supabase.from('jobs').select().eq('id', widget.jobId).single();
    JobApplicationRecord? existingApplication;

    final userId = widget.session?.user.id;
    if (userId != null) {
      final applicationResponse = await supabase
          .from('job_applications')
          .select()
          .eq('job_id', widget.jobId)
          .eq('worker_id', userId)
          .maybeSingle();
      if (applicationResponse != null) {
        existingApplication = JobApplicationRecord.fromMap(applicationResponse);
      }
    }

    return _JobDetailBundle(
      job: JobRecord.fromMap(jobResponse),
      application: existingApplication,
    );
  }

  Future<void> _refresh() async {
    final detail = await _fetchDetail();
    if (!mounted) return;
    setState(() => _detailFuture = Future.value(detail));
  }

  Future<void> _apply(JobRecord job) async {
    if (widget.session == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in first to apply for this job.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await supabase.rpc(
        'apply_to_job',
        params: {
          'p_job_id': job.id,
          'p_cover_note':
              _noteController.text.trim().isEmpty ? null : _noteController.text.trim(),
        },
      );
      _noteController.clear();
      await _refresh();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Application sent successfully.')),
      );
    } on PostgrestException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Job details')),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<_JobDetailBundle>(
            future: _detailFuture,
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    _StatusBanner(
                      text:
                          'This job could not be loaded right now. Pull down to retry.',
                      tone: _StatusTone.error,
                      actionLabel: 'Retry',
                      onAction: _refresh,
                    ),
                  ],
                );
              }
              if (!snapshot.hasData) {
                return ListView(
                  padding: EdgeInsets.all(20),
                  children: [_LoadingStack(count: 3)],
                );
              }

              final detail = snapshot.data!;
              final job = detail.job;
              final application = detail.application;
              final signedInUserId = widget.session?.user.id;
              final canApply =
                  signedInUserId != null &&
                  job.status == 'open' &&
                  job.clientId != signedInUserId &&
                  application == null;

              return ListView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
                children: [
                  _StatusPill(
                    label: job.urgent ? 'Urgent opening' : 'Live job',
                    tone: job.urgent ? _StatusTone.warning : _StatusTone.info,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    job.title,
                    style: const TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                      color: _brandInk,
                      height: 1.05,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      _MetaBadge(
                        icon: Icons.payments_rounded,
                        label: formatNaira(job.budgetNgn),
                      ),
                      _MetaBadge(
                        icon: Icons.location_on_rounded,
                        label: job.locationLabel,
                      ),
                      _MetaBadge(
                        icon: categoryMeta[job.category]!.icon,
                        label: categoryMeta[job.category]!.label,
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _Panel(
                    child: Text(
                      job.description?.trim().isNotEmpty == true
                          ? job.description!
                          : 'No extra notes were provided for this job.',
                      style: const TextStyle(
                        color: _brandSlate,
                        height: 1.7,
                        fontSize: 15,
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  if (application != null)
                    _StatusBanner(
                      text:
                          'You already applied to this job. Status: ${application.statusLabel}.',
                      tone: _StatusTone.success,
                    )
                  else if (widget.session == null)
                    const _StatusBanner(
                      text:
                          'Sign in from the Account tab to apply for this job from inside the app.',
                      tone: _StatusTone.info,
                    )
                  else if (signedInUserId == job.clientId)
                    const _StatusBanner(
                      text:
                          'This is your own job post, so applying is disabled here.',
                      tone: _StatusTone.info,
                    ),
                  if (canApply) ...[
                    const SizedBox(height: 18),
                    TextField(
                      controller: _noteController,
                      minLines: 4,
                      maxLines: 6,
                      decoration: const InputDecoration(
                        hintText:
                            'Add a short note about your availability, fit, or location.',
                      ),
                    ),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: _submitting ? null : () => _apply(job),
                      icon: _submitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.send_rounded),
                      label: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        child: Text(
                          _submitting ? 'Sending application...' : 'Apply now',
                        ),
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key, required this.session});

  final Session? session;

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  bool _signInMode = true;
  bool _busy = false;
  final _signInEmail = TextEditingController();
  final _signInPassword = TextEditingController();
  final _signUpName = TextEditingController();
  final _signUpEmail = TextEditingController();
  final _signUpPassword = TextEditingController();
  String _accountType = 'worker';
  String _city = areaOptions.first;

  @override
  void dispose() {
    _signInEmail.dispose();
    _signInPassword.dispose();
    _signUpName.dispose();
    _signUpEmail.dispose();
    _signUpPassword.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    if (_signInEmail.text.trim().isEmpty || _signInPassword.text.isEmpty) {
      _showMessage('Enter your email and password.');
      return;
    }

    setState(() => _busy = true);
    try {
      await supabase.auth.signInWithPassword(
        email: _signInEmail.text.trim(),
        password: _signInPassword.text,
      );
      if (!mounted) return;
      _showMessage('Welcome back.');
    } on AuthException catch (error) {
      _showMessage(error.message);
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _signUp() async {
    if (_signUpName.text.trim().length < 2) {
      _showMessage('Enter a valid display name.');
      return;
    }
    if (_signUpEmail.text.trim().isEmpty || _signUpPassword.text.length < 8) {
      _showMessage('Use a valid email and a password with at least 8 characters.');
      return;
    }

    setState(() => _busy = true);
    try {
      final response = await supabase.auth.signUp(
        email: _signUpEmail.text.trim(),
        password: _signUpPassword.text,
        data: {
          'display_name': _signUpName.text.trim(),
          'account_type': _accountType,
          'city': _city,
        },
      );
      if (!mounted) return;
      if (response.session == null) {
        _showMessage(
          'Account created. If email confirmation is enabled for this project, please verify your email before signing in.',
        );
      } else {
        _showMessage('Your account is ready.');
      }
    } on AuthException catch (error) {
      _showMessage(error.message);
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _signOut() async {
    await supabase.auth.signOut();
    if (!mounted) return;
    _showMessage('Signed out.');
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.session == null) {
      return SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          children: [
            const _TopBar(
              title: 'Account',
              subtitle:
                  'Sign in or create an account to manage applications, postings, and your dashboard from inside the app.',
            ),
            const SizedBox(height: 20),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: _brandLine),
              ),
              padding: const EdgeInsets.all(22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _ModeToggle(
                          label: 'Sign in',
                          active: _signInMode,
                          onTap: () => setState(() => _signInMode = true),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _ModeToggle(
                          label: 'Sign up',
                          active: !_signInMode,
                          onTap: () => setState(() => _signInMode = false),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  if (_signInMode) ...[
                    TextField(
                      controller: _signInEmail,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _signInPassword,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                      ),
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _busy ? null : _signIn,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        child: Text(_busy ? 'Signing in...' : 'Sign in'),
                      ),
                    ),
                  ] else ...[
                    TextField(
                      controller: _signUpName,
                      decoration: const InputDecoration(
                        labelText: 'Display name',
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _signUpEmail,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _signUpPassword,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _accountType,
                      items: const [
                        DropdownMenuItem(
                          value: 'worker',
                          child: Text('Job seeker'),
                        ),
                        DropdownMenuItem(
                          value: 'client',
                          child: Text('Job poster'),
                        ),
                      ],
                      decoration: const InputDecoration(labelText: 'Role'),
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _accountType = value);
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _city,
                      items: areaOptions
                          .map(
                            (city) => DropdownMenuItem(
                              value: city,
                              child: Text(city),
                            ),
                          )
                          .toList(),
                      decoration: const InputDecoration(labelText: 'Base area'),
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _city = value);
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _busy ? null : _signUp,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        child: Text(
                          _busy ? 'Creating account...' : 'Create account',
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      );
    }

    return _DashboardScreen(
      session: widget.session!,
      onSignOut: _signOut,
    );
  }
}

class _DashboardScreen extends StatefulWidget {
  const _DashboardScreen({
    required this.session,
    required this.onSignOut,
  });

  final Session session;
  final Future<void> Function() onSignOut;

  @override
  State<_DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<_DashboardScreen> {
  late Future<_DashboardBundle> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _dashboardFuture = _fetchDashboard();
  }

  Future<_DashboardBundle> _fetchDashboard() async {
    final userId = widget.session.user.id;
    final profileResponse = await supabase
        .from('profiles')
        .select()
        .eq('user_id', userId)
        .maybeSingle();
    final profile = profileResponse == null
        ? null
        : ProfileRecord.fromMap(profileResponse);

    final posted =
        await supabase.from('jobs').select('id').eq('client_id', userId);
    final assigned =
        await supabase.from('jobs').select('id').eq('worker_id', userId);
    final applied = await supabase
        .from('job_applications')
        .select('id')
        .eq('worker_id', userId);

    return _DashboardBundle(
      profile: profile,
      postedCount: posted.length,
      assignedCount: assigned.length,
      appliedCount: applied.length,
    );
  }

  Future<void> _refresh() async {
    final bundle = await _fetchDashboard();
    if (!mounted) return;
    setState(() => _dashboardFuture = Future.value(bundle));
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<_DashboardBundle>(
          future: _dashboardFuture,
          builder: (context, snapshot) {
            if (snapshot.hasError) {
              return ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  _StatusBanner(
                    text:
                        'Dashboard data could not be loaded right now. Pull down to retry.',
                    tone: _StatusTone.error,
                    actionLabel: 'Retry',
                    onAction: _refresh,
                  ),
                ],
              );
            }

            if (!snapshot.hasData) {
              return ListView(
                padding: EdgeInsets.all(20),
                children: [_LoadingStack(count: 4)],
              );
            }

            final dashboard = snapshot.data!;
            final profile = dashboard.profile;

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              children: [
                const _TopBar(
                  title: 'Dashboard',
                  subtitle:
                      'Live profile and activity data from the same Supabase project as the website.',
                ),
                const SizedBox(height: 20),
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF1E3A8A)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 58,
                            height: 58,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.14),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            padding: const EdgeInsets.all(10),
                            child: Image.asset('assets/app-logo.png'),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  profile?.displayName ??
                                      widget.session.user.email ??
                                      'GigsClose user',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  profile?.accountTypeLabel ?? 'Account',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.72),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          _GlassBadge(
                            icon: Icons.location_on_rounded,
                            label: profile?.city ?? 'Area not set',
                          ),
                          _GlassBadge(
                            icon: Icons.account_balance_wallet_rounded,
                            label: formatNaira(profile?.walletBalanceNgn ?? 0),
                          ),
                          _GlassBadge(
                            icon: Icons.verified_rounded,
                            label:
                                profile?.isVerified == true ? 'Verified' : 'Unverified',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final columns = constraints.maxWidth >= 820 ? 3 : 1;
                    final cards = [
                      _MetricCard(
                        title: 'Applications',
                        value: '${dashboard.appliedCount}',
                        body: 'Jobs you have applied to from this account.',
                        icon: Icons.send_rounded,
                        tone: const Color(0xFFE0F2FE),
                      ),
                      _MetricCard(
                        title: 'Posted jobs',
                        value: '${dashboard.postedCount}',
                        body: 'Open or past jobs created by your account.',
                        icon: Icons.work_history_rounded,
                        tone: const Color(0xFFFFEDD5),
                      ),
                      _MetricCard(
                        title: 'Assigned jobs',
                        value: '${dashboard.assignedCount}',
                        body: 'Jobs where you are currently set as worker.',
                        icon: Icons.check_circle_rounded,
                        tone: const Color(0xFFDCFCE7),
                      ),
                    ];

                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: cards.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: columns,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: columns == 1 ? 2.1 : 1.15,
                      ),
                      itemBuilder: (context, index) => cards[index],
                    );
                  },
                ),
                const SizedBox(height: 24),
                if ((profile?.skills ?? const <String>[]).isNotEmpty)
                  _Panel(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Skills',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: _brandInk,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: profile!.skills
                              .map((skill) => _SkillChip(label: skill))
                              .toList(),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 20),
                OutlinedButton.icon(
                  onPressed: widget.onSignOut,
                  icon: const Icon(Icons.logout_rounded),
                  label: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Text('Sign out'),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class JobListCard extends StatelessWidget {
  const JobListCard({
    super.key,
    required this.job,
    required this.onTap,
  });

  final JobRecord job;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final meta = categoryMeta[job.category]!;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(26),
      child: Ink(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: _brandLine),
          boxShadow: const [
            BoxShadow(
              color: Color(0x110F172A),
              blurRadius: 20,
              offset: Offset(0, 10),
            ),
          ],
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.title,
                        style: const TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                          color: _brandInk,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _MetaBadge(
                            icon: meta.icon,
                            label: meta.label,
                          ),
                          _MetaBadge(
                            icon: Icons.location_on_rounded,
                            label: job.locationLabel,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  formatNaira(job.budgetNgn),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: _brandBlue,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              job.description?.trim().isNotEmpty == true
                  ? job.description!
                  : 'No extra job notes provided.',
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: _brandSlate,
                height: 1.6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryResultsSection extends StatelessWidget {
  const _CategoryResultsSection({
    required this.label,
    required this.icon,
    required this.jobs,
    required this.onOpenJob,
  });

  final String label;
  final IconData icon;
  final List<JobRecord> jobs;
  final ValueChanged<JobRecord> onOpenJob;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: _brandBlue),
            const SizedBox(width: 8),
            Text(
              '$label (${jobs.length})',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: _brandInk,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...jobs.map(
          (job) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: JobListCard(job: job, onTap: () => onOpenJob(job)),
          ),
        ),
      ],
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({
    required this.signedIn,
    required this.onExplore,
    required this.onAccount,
  });

  final bool signedIn;
  final VoidCallback onExplore;
  final VoidCallback onAccount;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(34),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0F172A), Color(0xFF1E40AF), Color(0xFF38BDF8)],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x260F172A),
            blurRadius: 30,
            offset: Offset(0, 14),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.all(10),
                  child: Image.asset('assets/app-logo.png'),
                ),
                const Spacer(),
                const _StatusPill(
                  label: 'Native app',
                  tone: _StatusTone.success,
                  filled: true,
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              'Work should feel close, fast, and worth it.',
              style: TextStyle(
                color: Colors.white,
                fontSize: 31,
                fontWeight: FontWeight.w800,
                height: 1.02,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              signedIn
                  ? 'Browse live jobs, manage your dashboard, and apply inside the app without bouncing through the website.'
                  : 'Explore opportunities first, then sign in when you are ready to apply or manage your postings.',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.82),
                height: 1.6,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 24),
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 540;
                final primary = FilledButton.icon(
                  onPressed: onExplore,
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: _brandInk,
                  ),
                  icon: const Icon(Icons.travel_explore_rounded),
                  label: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Text('Explore jobs'),
                  ),
                );
                final secondary = OutlinedButton.icon(
                  onPressed: onAccount,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: BorderSide(
                      color: Colors.white.withValues(alpha: 0.35),
                    ),
                  ),
                  icon: Icon(
                    signedIn ? Icons.space_dashboard_rounded : Icons.login_rounded,
                  ),
                  label: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    child: Text(signedIn ? 'Open dashboard' : 'Sign in'),
                  ),
                );

                if (wide) {
                  return Row(
                    children: [
                      Expanded(child: primary),
                      const SizedBox(width: 12),
                      Expanded(child: secondary),
                    ],
                  );
                }

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    primary,
                    const SizedBox(height: 12),
                    secondary,
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 6),
        Text(
          title,
          style: const TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.w800,
            color: _brandInk,
            height: 1.08,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: const TextStyle(
            fontSize: 14,
            color: _brandSlate,
            height: 1.6,
          ),
        ),
      ],
    );
  }
}

class _SectionIntro extends StatelessWidget {
  const _SectionIntro({
    required this.eyebrow,
    required this.title,
    required this.body,
  });

  final String eyebrow;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          eyebrow.toUpperCase(),
          style: const TextStyle(
            fontSize: 12,
            letterSpacing: 1.7,
            fontWeight: FontWeight.w700,
            color: _brandBlue,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          title,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: _brandInk,
            height: 1.14,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          body,
          style: const TextStyle(
            fontSize: 14,
            height: 1.6,
            color: _brandSlate,
          ),
        ),
      ],
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({
    required this.block,
    required this.onTap,
  });

  final _CategoryBlock block;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(26),
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(26),
          color: Colors.white,
          border: Border.all(color: _brandLine),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: block.tone,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(block.icon, color: _brandInk),
            ),
            const SizedBox(height: 18),
            Text(
              block.label,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: _brandInk,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${block.count} open jobs',
              style: const TextStyle(
                color: _brandBlue,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            Text(
              block.jobs.isEmpty
                  ? 'New jobs in this category will land here automatically.'
                  : block.jobs.first.locationLabel,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: _brandSlate,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      selected: selected,
      onSelected: (_) => onTap(),
      label: Text(label),
      showCheckmark: false,
      selectedColor: _brandBlue.withValues(alpha: 0.12),
      side: BorderSide(
        color: selected ? _brandBlue : _brandLine,
      ),
      labelStyle: TextStyle(
        color: selected ? _brandBlue : _brandInk,
        fontWeight: FontWeight.w700,
      ),
      backgroundColor: Colors.white,
    );
  }
}

class _ModeToggle extends StatelessWidget {
  const _ModeToggle({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: onTap,
      style: FilledButton.styleFrom(
        backgroundColor: active ? _brandBlue : _brandSky,
        foregroundColor: active ? Colors.white : _brandInk,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Text(label),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.title,
    required this.value,
    required this.body,
    required this.icon,
    required this.tone,
  });

  final String title;
  final String value;
  final String body;
  final IconData icon;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: _brandLine),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: tone,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: _brandInk),
          ),
          const SizedBox(height: 18),
          Text(
            value,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: _brandInk,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: _brandInk,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: const TextStyle(
              color: _brandSlate,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: _brandLine),
      ),
      padding: const EdgeInsets.all(20),
      child: child,
    );
  }
}

class _EmptyCard extends StatelessWidget {
  const _EmptyCard({
    required this.title,
    required this.body,
  });

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: _brandInk,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: const TextStyle(
              color: _brandSlate,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

class _PromptCard extends StatelessWidget {
  const _PromptCard({
    required this.title,
    required this.body,
    required this.actionLabel,
    required this.onAction,
  });

  final String title;
  final String body;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: _brandInk,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: const TextStyle(
              color: _brandSlate,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 14),
          FilledButton.icon(
            onPressed: onAction,
            icon: const Icon(Icons.person_rounded),
            label: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(actionLabel),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({
    required this.text,
    required this.tone,
    this.actionLabel,
    this.onAction,
  });

  final String text;
  final _StatusTone tone;
  final String? actionLabel;
  final Future<void> Function()? onAction;

  @override
  Widget build(BuildContext context) {
    final color = switch (tone) {
      _StatusTone.info => const Color(0xFFE0F2FE),
      _StatusTone.success => const Color(0xFFDCFCE7),
      _StatusTone.warning => const Color(0xFFFEF3C7),
      _StatusTone.error => const Color(0xFFFEE2E2),
    };
    final accent = switch (tone) {
      _StatusTone.info => const Color(0xFF0369A1),
      _StatusTone.success => const Color(0xFF166534),
      _StatusTone.warning => const Color(0xFFB45309),
      _StatusTone.error => const Color(0xFFB91C1C),
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_rounded, color: accent),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: accent,
                height: 1.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          if (actionLabel != null && onAction != null)
            TextButton(
              onPressed: () => onAction!.call(),
              child: Text(actionLabel!),
            ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({
    required this.label,
    required this.tone,
    this.filled = false,
  });

  final String label;
  final _StatusTone tone;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final accent = switch (tone) {
      _StatusTone.info => const Color(0xFF0369A1),
      _StatusTone.success => const Color(0xFF166534),
      _StatusTone.warning => const Color(0xFFB45309),
      _StatusTone.error => const Color(0xFFB91C1C),
    };
    final background = switch (tone) {
      _StatusTone.info => const Color(0xFFE0F2FE),
      _StatusTone.success => const Color(0xFFDCFCE7),
      _StatusTone.warning => const Color(0xFFFEF3C7),
      _StatusTone.error => const Color(0xFFFEE2E2),
    };

    return Container(
      decoration: BoxDecoration(
        color: filled ? background.withValues(alpha: 0.18) : background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: filled ? Colors.white.withValues(alpha: 0.18) : Colors.transparent,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Text(
        label,
        style: TextStyle(
          color: filled ? Colors.white : accent,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _MetaBadge extends StatelessWidget {
  const _MetaBadge({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _brandSurface,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: _brandLine),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: _brandBlue),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: _brandInk,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _GlassBadge extends StatelessWidget {
  const _GlassBadge({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _SkillChip extends StatelessWidget {
  const _SkillChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _brandSky,
        borderRadius: BorderRadius.circular(999),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Text(
        label,
        style: const TextStyle(
          color: _brandInk,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _LoadingStack extends StatelessWidget {
  const _LoadingStack({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        count,
        (_) => Container(
          margin: const EdgeInsets.only(bottom: 14),
          height: 138,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(26),
            border: Border.all(color: _brandLine),
          ),
        ),
      ),
    );
  }
}

enum _StatusTone { info, success, warning, error }

class _CategoryBlock {
  const _CategoryBlock({
    required this.slug,
    required this.label,
    required this.icon,
    required this.tone,
    required this.count,
    required this.jobs,
  });

  final String slug;
  final String label;
  final IconData icon;
  final Color tone;
  final int count;
  final List<JobRecord> jobs;
}

class _JobDetailBundle {
  const _JobDetailBundle({
    required this.job,
    required this.application,
  });

  final JobRecord job;
  final JobApplicationRecord? application;
}

class _DashboardBundle {
  const _DashboardBundle({
    required this.profile,
    required this.postedCount,
    required this.assignedCount,
    required this.appliedCount,
  });

  final ProfileRecord? profile;
  final int postedCount;
  final int assignedCount;
  final int appliedCount;
}

class JobRecord {
  const JobRecord({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.budgetNgn,
    required this.locationLabel,
    required this.status,
    required this.urgent,
    required this.clientId,
  });

  final String id;
  final String title;
  final String? description;
  final String category;
  final int budgetNgn;
  final String locationLabel;
  final String status;
  final bool urgent;
  final String clientId;

  factory JobRecord.fromMap(Map<String, dynamic> map) {
    return JobRecord(
      id: map['id'] as String,
      title: (map['title'] ?? '') as String,
      description: map['description'] as String?,
      category: (map['category'] ?? 'other') as String,
      budgetNgn: ((map['budget_ngn'] ?? 0) as num).round(),
      locationLabel: (map['location_label'] ?? 'Unspecified') as String,
      status: (map['status'] ?? 'open') as String,
      urgent: map['urgent'] == true,
      clientId: (map['client_id'] ?? '') as String,
    );
  }
}

class ProfileRecord {
  const ProfileRecord({
    required this.displayName,
    required this.accountType,
    required this.city,
    required this.skills,
    required this.walletBalanceNgn,
    required this.isVerified,
  });

  final String displayName;
  final String accountType;
  final String? city;
  final List<String> skills;
  final int walletBalanceNgn;
  final bool isVerified;

  String get accountTypeLabel =>
      accountType == 'client' ? 'Job poster' : 'Job seeker';

  factory ProfileRecord.fromMap(Map<String, dynamic> map) {
    return ProfileRecord(
      displayName: (map['display_name'] ?? 'GigsClose user') as String,
      accountType: (map['account_type'] ?? 'worker') as String,
      city: map['city'] as String?,
      skills: ((map['skills'] ?? const []) as List)
          .map((item) => '$item')
          .where((item) => item.trim().isNotEmpty)
          .toList(),
      walletBalanceNgn: ((map['wallet_balance_ngn'] ?? 0) as num).round(),
      isVerified: map['is_verified'] == true,
    );
  }
}

class JobApplicationRecord {
  const JobApplicationRecord({
    required this.status,
  });

  final String status;

  String get statusLabel {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending review';
    }
  }

  factory JobApplicationRecord.fromMap(Map<String, dynamic> map) {
    return JobApplicationRecord(
      status: (map['status'] ?? 'pending') as String,
    );
  }
}

class CategoryMeta {
  const CategoryMeta({
    required this.label,
    required this.icon,
    required this.tone,
  });

  final String label;
  final IconData icon;
  final Color tone;
}

const Map<String, CategoryMeta> categoryMeta = {
  'cleaning': CategoryMeta(
    label: 'Cleaning',
    icon: Icons.cleaning_services_rounded,
    tone: Color(0xFFE0F2FE),
  ),
  'delivery': CategoryMeta(
    label: 'Delivery',
    icon: Icons.delivery_dining_rounded,
    tone: Color(0xFFFFEDD5),
  ),
  'electrical': CategoryMeta(
    label: 'Electrical',
    icon: Icons.bolt_rounded,
    tone: Color(0xFFFEF3C7),
  ),
  'plumbing': CategoryMeta(
    label: 'Plumbing',
    icon: Icons.plumbing_rounded,
    tone: Color(0xFFDCFCE7),
  ),
  'moving': CategoryMeta(
    label: 'Moving',
    icon: Icons.local_shipping_rounded,
    tone: Color(0xFFFCE7F3),
  ),
  'creative': CategoryMeta(
    label: 'Creative',
    icon: Icons.camera_alt_rounded,
    tone: Color(0xFFF3E8FF),
  ),
  'handyman': CategoryMeta(
    label: 'Handyman',
    icon: Icons.handyman_rounded,
    tone: Color(0xFFE0E7FF),
  ),
  'other': CategoryMeta(
    label: 'Other',
    icon: Icons.auto_awesome_rounded,
    tone: Color(0xFFE2E8F0),
  ),
};

const areaOptions = [
  'Lekki Phase 1',
  'Victoria Island',
  'Ikoyi',
  'Yaba',
  'Ikeja GRA',
  'Surulere',
  'Magodo',
  'Marina',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Benin City',
  'Lagos Island',
  'Epe',
  'Kano',
  'Jos',
  'Enugu',
  'Owerri',
  'Uyo',
  'Kaduna',
  'Ilorin',
  'Osogbo',
  'Onitsha',
  'Calabar',
];

Map<String, List<JobRecord>> groupJobsByCategory(List<JobRecord> jobs) {
  final grouped = <String, List<JobRecord>>{};
  for (final job in jobs) {
    grouped.putIfAbsent(job.category, () => <JobRecord>[]).add(job);
  }
  return grouped;
}

String normalizeSearchText(String value) {
  return value
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9\s]'), ' ')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

List<String> tokenizeSearchQuery(String query) {
  return normalizeSearchText(query)
      .split(' ')
      .map((part) => part.trim())
      .where((part) => part.isNotEmpty)
      .toList();
}

String getJobSearchText(JobRecord job) {
  return normalizeSearchText(
    '${job.title} ${job.description ?? ''} ${job.locationLabel} ${categoryMeta[job.category]?.label ?? 'Other'}',
  );
}

bool matchesAllSearchTerms(JobRecord job, String query) {
  final terms = tokenizeSearchQuery(query);
  if (terms.isEmpty) return true;
  final searchText = getJobSearchText(job);
  return terms.every(searchText.contains);
}

String formatNaira(int amount) {
  final digits = amount.abs().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    final remaining = digits.length - i;
    buffer.write(digits[i]);
    if (remaining > 1 && remaining % 3 == 1) {
      buffer.write(',');
    }
  }
  final prefix = amount < 0 ? '-₦' : '₦';
  return '$prefix$buffer';
}
